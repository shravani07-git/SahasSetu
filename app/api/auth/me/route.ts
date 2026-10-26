import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select('-passwordHash');

    if (!user || !user.isActive) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 401 });
      response.cookies.set('safeher-token', '', { maxAge: 0, path: '/' });
      return response;
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organization: user.organization,
        isVerified: user.isVerified,
        anonymousId: user.anonymousId,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
