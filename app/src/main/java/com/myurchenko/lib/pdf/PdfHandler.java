package com.myurchenko.lib.pdf;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.xhtmlrenderer.pdf.ITextRenderer;
import com.itextpdf.text.pdf.BaseFont;

public class PdfHandler {

  public byte[] exportHtml(String html) throws Exception {

    ITextRenderer renderer = new ITextRenderer();
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
    Document doc = builder.parse(new ByteArrayInputStream(html.replaceAll("&nbsp;", "").getBytes()));

    renderer.setDocument(doc, null);
    renderer.getFontResolver().addFont("assets/fonts/openSans.ttf", BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
    renderer.layout();
    renderer.createPDF(out);
    out.flush();
    out.close();
    return out.toByteArray();
  }
}