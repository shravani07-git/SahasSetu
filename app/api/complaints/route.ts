import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint } from '@/lib/db/models';
import { requireAuth, createAuditLog } from '@/lib/auth/session';
import { decryptComplaintFields, encryptComplaintFields } from '@/lib/field-encryption';
import { classifyComplaint } from '@/lib/ml-client';

// GET /api/complaints - List user's complaints
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = { userId: auth.session!.userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('assignedCommittee', 'name type')
        .populate('assignedNGO', 'name city')
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return NextResponse.json({
      complaints: complaints.map((complaint) => decryptComplaintFields(complaint as Record<string, any>)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/complaints - Create new complaint
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      incidentDate,
      incidentTime,
      location,
      incidentType,
      description,
      perpetratorInfo,
      witnesses,
      previousIncidents,
      isAnonymous,
      isEncrypted,
      delayedSubmission,
      scheduledSubmitDate,
      status: requestedStatus,
    } = body;

    if (!incidentDate || !incidentType || !description) {
      return NextResponse.json(
        { error: 'Incident date, type, and description are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const complaintStatus = requestedStatus === 'draft' ? 'draft' : 'submitted';

    const encryptedSensitiveFields = encryptComplaintFields({
      location,
      description,
      perpetratorInfo,
      witnesses,
      previousIncidents,
    });

    // Classification is advisory only and never blocks a complaint submission.
    // If the separately deployed ML service/model is unavailable, the complaint
    // is still stored normally.
    let mlClassification: Record<string, any> | undefined;
    try {
      const classification = await classifyComplaint(description);
      if (classification?.model_available && classification?.harassment_type && classification?.severity) {
        mlClassification = {
          harassmentType: classification.harassment_type,
          severity: classification.severity,
          typeConfidence: classification.type_confidence,
          severityConfidence: classification.severity_confidence,
          modelVersion: classification.model_version,
          classifiedAt: new Date(),
        };
      }
    } catch (error) {
      console.warn('ML classification unavailable; continuing without it:', error);
    }

    const complaint = new Complaint({
      userId: auth.session!.userId,
      isAnonymous: isAnonymous || false,
      incidentDate: new Date(incidentDate),
      incidentTime,
      ...encryptedSensitiveFields,
      incidentType,
      mlClassification,
      status: complaintStatus,
      isEncrypted: isEncrypted !== false,
      delayedSubmission: delayedSubmission || false,
      scheduledSubmitDate: scheduledSubmitDate ? new Date(scheduledSubmitDate) : undefined,
      timeline: [
        {
          status: complaintStatus,
          description:
            complaintStatus === 'draft'
              ? 'Complaint drafted'
              : 'Complaint submitted successfully',
          updatedBy: auth.session!.userId,
          updatedByRole: auth.session!.role,
        },
      ],
    });
    await complaint.save();

    await createAuditLog(
      auth.session!.userId,
      'complaint.create',
      'complaint',
      `New complaint ${complaint.caseId} created (${complaintStatus})`,
      { caseId: complaint.caseId, incidentType, isAnonymous },
      request
    );

    const safeComplaint = decryptComplaintFields(complaint.toObject() as Record<string, any>);
    return NextResponse.json({ success: true, complaint: safeComplaint }, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
