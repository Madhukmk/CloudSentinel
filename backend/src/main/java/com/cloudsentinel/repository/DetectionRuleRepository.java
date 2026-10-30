package com.cloudsentinel.repository;

import com.cloudsentinel.entity.ConditionType;
import com.cloudsentinel.entity.DetectionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetectionRuleRepository extends JpaRepository<DetectionRule, Long> {
    List<DetectionRule> findByEnabledTrue();
    List<DetectionRule> findByConditionTypeAndEnabledTrue(ConditionType conditionType);
    List<DetectionRule> findTop5ByRuleNameContainingIgnoreCase(String ruleName);
}
