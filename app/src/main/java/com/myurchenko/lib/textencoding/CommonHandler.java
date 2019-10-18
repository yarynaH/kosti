package com.myurchenko.lib.textencoding;

import java.nio.charset.StandardCharsets;

import com.google.common.io.ByteSource;

abstract class CommonHandler
{
    ByteSource toByteSource( final Object value )
    {
        if ( value instanceof ByteSource )
        {
            return (ByteSource) value;
        }
        else if ( value instanceof String )
        {
            return ByteSource.wrap( ( (String) value ).getBytes( StandardCharsets.UTF_8 ) );
        }
        else if ( value instanceof Boolean || value instanceof Number )
        {
            return ByteSource.wrap( value.toString().getBytes( StandardCharsets.UTF_8 ) );
        }
        return ByteSource.empty();
    }
}