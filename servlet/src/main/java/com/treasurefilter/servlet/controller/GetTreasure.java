package com.treasurefilter.servlet.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController//这是一个控制器并只返回数据不寻找视图
public class GetTreasure {
    @RequestMapping("/getTreasure") //将本方法映射到url
    public String getTreasure(@RequestParam("name") String name) {
        return name;
    }
}
