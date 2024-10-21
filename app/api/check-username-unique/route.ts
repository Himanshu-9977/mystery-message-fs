import { z } from "zod";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const queryParams = searchParams.get("username");

    // Check with zod
    const parsed = UsernameQuerySchema.safeParse({ username: queryParams });
    if (!parsed.success) {
      const usernameErrors = parsed.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query params",
        },
        { status: 400 }
      );
    }

    const { username } = parsed.data;
    const existingUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken.",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json(
      { success: false, message: "Failed to check username." },
      { status: 500 }
    );
  }
}
