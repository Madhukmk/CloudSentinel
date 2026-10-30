package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.service.DemoSimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@Tag(name = "Threat Simulation Demo", description = "Controlled attack simulations for SIEM demonstration and evaluation")
public class DemoController {

    @Autowired
    private DemoSimulationService demoSimulationService;

    @PostMapping("/brute-force")
    @Operation(summary = "Simulate 6 rapid failed login attempts to trigger Brute Force Detection rule")
    public ResponseEntity<ApiResponse<Map<String, Object>>> simulateBruteForce(
            @RequestParam(required = false, defaultValue = "192.168.1.105") String sourceIp) {
        Map<String, Object> result = demoSimulationService.simulateBruteForce(sourceIp);
        return ResponseEntity.ok(ApiResponse.ok("Brute-force attack simulation completed", result));
    }

    @PostMapping("/port-scan")
    @Operation(summary = "Simulate reconnaissance port sweep against restricted ports (22, 23, 3389, 4444)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> simulatePortScan(
            @RequestParam(required = false, defaultValue = "10.10.4.52") String sourceIp) {
        Map<String, Object> result = demoSimulationService.simulatePortScan(sourceIp);
        return ResponseEntity.ok(ApiResponse.ok("Port scan simulation completed", result));
    }

    @PostMapping("/correlation-attack")
    @Operation(summary = "Simulate 5 failed logins followed by a successful login to trigger CRITICAL correlation alert")
    public ResponseEntity<ApiResponse<Map<String, Object>>> simulateCorrelation(
            @RequestParam(required = false, defaultValue = "172.16.8.99") String sourceIp) {
        Map<String, Object> result = demoSimulationService.simulateCorrelationAttack(sourceIp);
        return ResponseEntity.ok(ApiResponse.ok("Correlation attack simulation completed", result));
    }
}
