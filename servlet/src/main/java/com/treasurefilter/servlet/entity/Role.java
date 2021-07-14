package com.treasurefilter.servlet.entity;

import com.treasurefilter.servlet.resultEntity.ServerResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    String id;
    String roleUid;
    String name;
    String gender;
    String grade;
    String school;
    String neigongyanxiu;
    String price;
    ServerResult server;
    String status;
}
