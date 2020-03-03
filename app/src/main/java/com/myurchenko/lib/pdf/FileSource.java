package com.myurchenko.lib.pdf;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.util.Date;

public class FileSource implements Serializable {

  private String name;
  private String absolutePath;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "GMT")
  private Date lastModified = null;

  private byte[] content;

  public byte[] getContent() {
    return content;
  }

  public void setContent(byte[] source) {
    this.content = source;
  }

  public String getName() {
    return name;
  }

  public void setName(String fileName) {
    this.name = fileName;
  }

  public String getAbsolutePath() {
    return absolutePath;
  }

  public void setAbsolutePath(String absolutePath) {
    this.absolutePath = absolutePath;
  }

  public void setLastModified(Date lastModified) {
    this.lastModified = lastModified;
  }

  public Date getLastModified() {
    return lastModified;
  }
}