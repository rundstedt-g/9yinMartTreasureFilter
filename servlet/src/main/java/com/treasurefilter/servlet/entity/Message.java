package com.treasurefilter.servlet.entity;

import com.treasurefilter.servlet.util.UuidBaseEntity;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "message")
@Getter
@Setter
public class Message extends UuidBaseEntity {
    //留言内容
    @Basic
    @Column(name = "content", nullable = false, length = 200)
    private String content;

    //创建时间, 精确到毫秒的时间戳
    @Basic
    @Column(name = "create_time")
    private Long createTime;
}