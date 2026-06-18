package com.mihir.springsightai.report.entity;

import com.mihir.springsightai.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_reports", indexes = {
        @Index(name = "idx_analysis_reports_user_created", columnList = "user_id, created_at"),
        @Index(name = "idx_analysis_reports_user_severity", columnList = "user_id, severity")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String filename;

    @NotNull
    @Min(0)
    @Column(name = "total_logs", nullable = false)
    private Integer totalLogs;

    @NotNull
    @Min(0)
    @Column(name = "error_count", nullable = false)
    private Integer errorCount;

    @NotNull
    @Min(0)
    @Column(name = "warn_count", nullable = false)
    private Integer warnCount;

    @NotNull
    @Min(0)
    @Column(name = "info_count", nullable = false)
    private Integer infoCount;

    @NotBlank
    @Column(name = "root_cause", nullable = false, columnDefinition = "TEXT")
    private String rootCause;

    @NotBlank
    @Pattern(regexp = "LOW|MEDIUM|HIGH|CRITICAL")
    @Column(nullable = false, length = 20)
    private String severity;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String impact;

    @NotBlank
    @Column(name = "recommended_fix", nullable = false, columnDefinition = "TEXT")
    private String recommendedFix;

    @NotBlank
    @Column(name = "prevention_steps", nullable = false, columnDefinition = "TEXT")
    private String preventionSteps;

    @NotBlank
    @Pattern(regexp = "LOW|MEDIUM|HIGH")
    @Column(nullable = false, length = 20)
    private String confidence;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
