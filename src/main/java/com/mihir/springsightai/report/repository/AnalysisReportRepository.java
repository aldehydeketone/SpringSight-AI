package com.mihir.springsightai.report.repository;

import com.mihir.springsightai.report.entity.AnalysisReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {

    List<AnalysisReport> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndSeverity(Long userId, String severity);

    @Query("select coalesce(sum(r.errorCount), 0) from AnalysisReport r where r.user.id = :userId")
    long sumErrorCountByUserId(@Param("userId") Long userId);
}
