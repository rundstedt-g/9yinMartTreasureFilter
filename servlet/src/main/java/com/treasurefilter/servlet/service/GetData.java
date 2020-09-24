package com.treasurefilter.servlet.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class GetData {
    public String getdata(){
        RestTemplate restTemplate=new RestTemplate(); //创建请求
        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId","186100101");
        params.put("typeNameParam","146");
        params.put("gameId","10");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));
        System.out.println(Long.toString(timestamp));
        ResponseEntity<String> responseEntity=restTemplate.getForEntity("http://jishi.woniu.com/9yin/anonymous/findSellingGoods.do?serverId={serverId}&gameId={gameId}&typeNameParam={typeNameParam}&_={}",String.class,params);
        return responseEntity.getBody();
    }
}