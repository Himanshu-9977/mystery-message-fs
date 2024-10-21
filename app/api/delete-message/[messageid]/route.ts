import UserModel from '@/models/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';

// import { useSearchParams } from "next/navigation";  not gona work 

/* 
// app/[foo]/[bar]/page.tsx

import { Outer } from "../../Outer";
import { store } from "../../store";

export default function Page ({params}: {params: { foo: string; bar: string }}) {

  const { foo, bar } = params;
  store.setData(`/${foo}/${bar}`);
  return <Outer />;
} */


export async function DELETE(
  request: Request,
  { params }: { params: { message_id: string } } // this is the way to take the data dynamically in serverside
) {

  const messageId = params.message_id;
  console.log(messageId)

  /* const searchParams = useSearchParams();   useParams can only be run on client side and this is a {api}
  const messageId = searchParams.get("message_id"); */

  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: User = session?.user;
  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { message: { createdAt: messageId}}}
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}