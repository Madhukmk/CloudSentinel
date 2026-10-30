package com.cloudsentinel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.cloudsentinel.entity")
@EnableJpaRepositories(basePackages = "com.cloudsentinel.repository")
public class CloudSentinelApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloudSentinelApplication.class, args);
    }
}

