package com.treasurefilter.servlet.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wuxue {
    public String name;
    public String type;
    public String level;

    public static Boolean isGupuWuxue(String taolu){
        ArrayList<String> gupuWuxueSet = new ArrayList<>();

        gupuWuxueSet.add("徒手套路/捻花功(古谱)");
        gupuWuxueSet.add("徒手套路/太极拳(古谱)");
        gupuWuxueSet.add("徒手套路/大力金刚指");
        gupuWuxueSet.add("徒手套路/花神七式(无缺)");
        gupuWuxueSet.add("徒手套路/野球拳");
        gupuWuxueSet.add("徒手套路/降龙掌法(绝世)");
        gupuWuxueSet.add("徒手套路/降龙掌法(绝世)");
        gupuWuxueSet.add("徒手套路/九阳·绝学");
        gupuWuxueSet.add("徒手套路/圣梅秘诀(古谱)");

        gupuWuxueSet.add("单剑套路/无我剑诀");
        gupuWuxueSet.add("单剑套路/魅影剑法");
        gupuWuxueSet.add("单剑套路/灵犀剑法");

        gupuWuxueSet.add("单刀套路/血海魔刀录");

        gupuWuxueSet.add("匕首套路/焚天令秘笈");

        gupuWuxueSet.add("短棍套路/打狗八绝(古谱)");

        gupuWuxueSet.add("奇门套路/天魔八音");

        return gupuWuxueSet.contains(taolu);
    }

    public static Boolean is99Wuxue(String taolu) {
        ArrayList<String> _99WuxueSet = new ArrayList<>();

        _99WuxueSet.add("徒手套路/铁头功");
        _99WuxueSet.add("徒手套路/清国清城掌");
        _99WuxueSet.add("徒手套路/御风连环腿");
        _99WuxueSet.add("徒手套路/心佛掌");

        _99WuxueSet.add("单剑套路/墨子剑法");
        _99WuxueSet.add("单剑套路/云霄飞剑");
        _99WuxueSet.add("单剑套路/寒梅剑法");

        _99WuxueSet.add("双剑套路/九宫剑法");
        _99WuxueSet.add("双剑套路/七星剑");

        _99WuxueSet.add("单刀套路/炎阳刀法");
        _99WuxueSet.add("单刀套路/云狐刀法");
        _99WuxueSet.add("单刀套路/惊霜七诀");

        _99WuxueSet.add("双刀套路/鸳鸯双刀");
        _99WuxueSet.add("双刀套路/修罗刀");
        _99WuxueSet.add("双刀套路/日月颠刀诀");

        _99WuxueSet.add("匕首套路/勾魂七夺");
        _99WuxueSet.add("匕首套路/神风诀");
        _99WuxueSet.add("匕首套路/鬼王刺");

        _99WuxueSet.add("双刺套路/霓裳动");
        _99WuxueSet.add("双刺套路/天罗舞");
        _99WuxueSet.add("双刺套路/伏月刺诀");

        _99WuxueSet.add("长棍套路/五郎八卦棍");
        _99WuxueSet.add("长棍套路/求败棍法");
        _99WuxueSet.add("长棍套路/武圣棍法");
        _99WuxueSet.add("长棍套路/风波棍");

        _99WuxueSet.add("短棍套路/风雷降魔杖");
        _99WuxueSet.add("短棍套路/十字追魂棍");

        return _99WuxueSet.contains(taolu);
    }
}
