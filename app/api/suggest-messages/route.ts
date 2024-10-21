import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Create a new instance of the GenerativeAI class
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        
        // Initialize a generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        // Define a prompt variable
        const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

        // Pass the prompt to the model and retrieve the output
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const output = await response.text();

        return NextResponse.json({ success:true, message: "Messages generated successfully", data: output });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'An error occurred while generating content' }, { status: 500 });
    }
}