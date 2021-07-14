package com.treasurefilter.servlet.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleContent {
    public List<String> baowu;
    public List<String> baowuOfBackpack;
    public List<String> threeSkills;
    public List<String> twoSkills;
    public List<String> wawa;
    public List<String> wawaOfBackpack;
    public List<Neigong> neigongs;
    public List<Wuxue> gupuWuxues;
    public List<Wuxue> _99Wuxues;
    public List<Jingmai> jingmais;
    public List<UseCardRec> useCardRecList;
    public List<String> mounts;
}
