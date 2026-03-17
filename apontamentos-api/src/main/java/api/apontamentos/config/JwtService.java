package api.apontamentos.config;


import java.util.Date;

import org.springframework.stereotype.Service;

import api.apontamentos.entity.Usuarios;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;


@Service
public class JwtService {

    private static final String SECRET = "chave-de-cesso-com-mais-de-32-caracteres";

    public String gerarToken(Usuarios usuario){
        return Jwts.builder()
            .setSubject(usuario.getUsuario())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hora de validade
            .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()), SignatureAlgorithm.HS256)
            .compact();
    }

    public String extrairEmail(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(SECRET.getBytes())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
