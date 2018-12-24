package com.enonic.app.simpleidprovider;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class GravatarHashHandler
    implements ScriptBean
{
    private String email;


    public void setEmail( final String email )
    {
        this.email = email;
    }

    public String execute()
        throws NoSuchAlgorithmException, UnsupportedEncodingException
    {
        MessageDigest messageDigest = MessageDigest.getInstance( "MD5" );
        return hex( messageDigest.digest( this.email.getBytes( "CP1252" ) ) );
    }

    public static String hex( byte[] array )
    {
        StringBuffer sb = new StringBuffer();
        for ( int i = 0; i < array.length; ++i )
        {
            sb.append( Integer.toHexString( ( array[i] & 0xFF ) | 0x100 ).substring( 1, 3 ) );
        }
        return sb.toString();
    }

    @Override
    public void initialize( final BeanContext context )
    {

    }
}
