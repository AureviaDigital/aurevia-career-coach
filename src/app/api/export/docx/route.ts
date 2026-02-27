import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { getProStatus } from "@/lib/proStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, title, content, deviceId } = body;

    // Validate required fields
    if (!filename || !title || !content) {
      return NextResponse.json(
        { error: "filename, title, and content are required" },
        { status: 400 }
      );
    }

    // Pro-only gate: DOCX export requires Pro
    if (!deviceId || !(await getProStatus(deviceId))) {
      return NextResponse.json(
        { error: "pro_required", message: "DOCX export is a Pro feature." },
        { status: 403 }
      );
    }

    console.log(`Generating DOCX for: ${filename}`);

    // Split content into lines and create paragraphs
    const contentLines = content.split("\n");

    // Create title paragraph (centered, bold)
    const titleParagraph = new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 32, // 16pt font
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400, // Space after title
      },
    });

    // Create body paragraphs (preserve line breaks)
    const bodyParagraphs = contentLines.map(
      (line: string) =>
        new Paragraph({
          children: [
            new TextRun({
              text: line || "", // Empty string for blank lines
              size: 24, // 12pt font
            }),
          ],
          spacing: {
            after: 100, // Small space between lines
          },
        })
    );

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [titleParagraph, ...bodyParagraphs],
        },
      ],
    });

    // Generate the DOCX file as a buffer and convert to Uint8Array
    const buffer = await Packer.toBuffer(doc);
    const arrayBuffer = new Uint8Array(buffer);

    // Return the file as a download
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}.docx"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("DOCX_EXPORT_ERROR", err);
    console.error(err?.stack);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
