package com.cloudsentinel;

import com.cloudsentinel.dto.LogIngestRequest;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.entity.Severity;
import com.cloudsentinel.normalization.LogNormalizationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class LogNormalizationTest {

    private LogNormalizationService normalizationService;

    @BeforeEach
    void setUp() {
        normalizationService = new LogNormalizationService();
        ReflectionTestUtils.setField(normalizationService, "objectMapper", new ObjectMapper());
    }

    @Test
    @DisplayName("Normalization maps heterogeneous firewall fields (src, user, msg) correctly")
    void testHeterogeneousFieldMapping() {
        LogIngestRequest req = new LogIngestRequest();
        req.setSrc("192.168.1.120");
        req.setUser("root");
        req.setMsg("Login failure for root account");
        req.setSeverity("critical");

        SecurityLog normalized = normalizationService.normalize(req, "PaloAlto-FW");

        assertEquals("192.168.1.120", normalized.getSourceIp());
        assertEquals("root", normalized.getUsername());
        assertEquals("LOGIN_FAILED", normalized.getAction());
        assertEquals(Severity.CRITICAL, normalized.getSeverity());
        assertEquals("PaloAlto-FW", normalized.getSourceName());
        assertNotNull(normalized.getRawLog(), "Raw log must be preserved");
    }

    @Test
    @DisplayName("Severity string mapping handles various formats")
    void testSeverityMapping() {
        assertEquals(Severity.CRITICAL, normalizationService.normalizeSeverity("CRIT"));
        assertEquals(Severity.CRITICAL, normalizationService.normalizeSeverity("fatal"));
        assertEquals(Severity.HIGH, normalizationService.normalizeSeverity("ERROR"));
        assertEquals(Severity.MEDIUM, normalizationService.normalizeSeverity("WARN"));
        assertEquals(Severity.LOW, normalizationService.normalizeSeverity("info"));
        assertEquals(Severity.LOW, normalizationService.normalizeSeverity(null));
    }
}
