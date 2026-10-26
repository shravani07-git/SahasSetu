import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { NGO } from '@/lib/db/models';

// GET /api/ngos - List NGOs (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const service = searchParams.get('service');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = { isActive: true, verified: true };

    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (service) filter.services = service;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [ngos, total] = await Promise.all([
      NGO.find(filter)
        .sort({ rating: -1, casesHandled: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      NGO.countDocuments(filter),
    ]);

    return NextResponse.json({
      ngos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/ngos - Register new NGO (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    const ngo = await NGO.create(body);
    return NextResponse.json({ success: true, ngo }, { status: 201 });
  } catch (error) {
    console.error('Error creating NGO:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
