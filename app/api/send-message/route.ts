import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 404 }
      );
    }

    // is user accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "user not accepting message",
        },
        { status: 403 }
      );
    }

    const newMessage = {content, createdAt: new Date()};
    // console.log("new msg ->", newMessage);

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error in sending messages", error);
    return Response.json(
      {
        success: false,
        message: "error in sending messages",
      },
      { status: 500 }
    );
  }
}