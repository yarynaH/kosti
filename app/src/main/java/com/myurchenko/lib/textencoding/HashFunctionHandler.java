package com.myurchenko.lib.textencoding;

import java.io.IOException;

import org.apache.commons.codec.digest.DigestUtils;
import java.security.MessageDigest;
import java.util.Base64;

import java.io.*;
import java.nio.charset.StandardCharsets;

public final class HashFunctionHandler extends CommonHandler {
  private String stream;

  public void setStream(final String stream) {
    this.stream = stream;
  }

  public String sha1AsHex() throws IOException {
    String digest = "";
    try {
      digest = Base64.getEncoder()
          .encodeToString(MessageDigest.getInstance("SHA-1").digest(stream.getBytes("ISO-8859-1")));
    } catch (Exception e) {
    }
    return digest;
  }

}