package com.treasurefilter.servlet.repository;

import com.treasurefilter.servlet.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, String>, JpaSpecificationExecutor {
}