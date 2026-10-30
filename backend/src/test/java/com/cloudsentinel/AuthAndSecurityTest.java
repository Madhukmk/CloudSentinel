package com.cloudsentinel;

import com.cloudsentinel.entity.Role;
import com.cloudsentinel.entity.User;
import com.cloudsentinel.security.JwtTokenProvider;
import com.cloudsentinel.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import static org.junit.jupiter.api.Assertions.*;

public class AuthAndSecurityTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String testSecret = "CloudSentinelTestSecretKeyForJwtSigningMustBeAtLeast256BitsLong!";
    private final long testExpiration = 3600000; // 1 hr

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(testSecret, testExpiration);
    }

    @Test
    @DisplayName("JWT Token Generation and Validation")
    void testJwtTokenGenerationAndValidation() {
        String email = "analyst@cloudsentinel.com";
        String token = jwtTokenProvider.generateToken(email, 2L, "Analyst User", "ANALYST");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(token));
    }

    @Test
    @DisplayName("UserPrincipal creates valid authorities based on role")
    void testUserPrincipalCreation() {
        User user = new User("SOC Admin", "admin@cloudsentinel.com", "hash", Role.ADMIN);
        user.setId(1L);

        UserPrincipal principal = UserPrincipal.create(user);
        assertEquals("admin@cloudsentinel.com", principal.getUsername());
        assertTrue(principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(principal.isEnabled());
    }
}
