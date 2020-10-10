package com.treasurefilter.servlet.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import org.springframework.web.client.RestTemplate;


import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class GetData {
    public String getdata(String status,
                          String serverId,
                          String sortWay,
                          String sortField,
                          String itemName,
                          String bwa1,
                          String bwa2,
                          String bwa3,
                          String bwa4,
                          String bwa5,
                          String bwa6,
                          String pageIndex
                          ){
        RestTemplate restTemplate=new RestTemplate(); //创建请求
        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("typeNameParam","146");
        params.put("gameId","10");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));
        String urlPageIndex, urlSortWay, urlSortField, urlItemName,bwa;
        if(sortWay==""){
            urlSortWay = "";
        }
        else {
            urlSortWay = "&sortWay={sortWay}";
            params.put("sortWay",sortWay);
        }
        if(sortField==""){
            urlSortField = "";
        }
        else {
            urlSortField = "&sortField={sortField}";
            params.put("sortField",sortField);
        }
        if(itemName==""){
            urlItemName = "";
        }
        else {
            urlItemName = "&itemName={itemName}";
            params.put("itemName",itemName);
        }
        if(pageIndex==""){
            urlPageIndex = "";
        }
        else {
            urlPageIndex = "&pageIndex={pageIndex}";
            params.put("pageIndex",pageIndex);
        }
        if(bwa1==""){
            bwa = "";
        }
        else{
            bwa = "&bwa1={bwa1}";
            params.put("bwa1",bwa1);
            if(bwa2!=""){
                bwa += "&bwa2={bwa2}";
                params.put("bwa2",bwa2);
                if(bwa3!=""){
                    bwa += "&bwa3={bwa3}";
                    params.put("bwa3",bwa3);
                    if(bwa4!=""){
                        bwa += "&bwa4={bwa4}";
                        params.put("bwa4",bwa4);
                        if(bwa5!=""){
                            bwa += "&bwa5={bwa5}";
                            params.put("bwa5",bwa5);
                            if(bwa6!=""){
                                bwa += "&bwa6={bwa6}";
                                params.put("bwa6",bwa6);
                            }
                        }
                    }
                }
            }
        }

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("anonymousPage"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求
        ResponseEntity<String> responseEntity=restTemplate.exchange("http://jishi.woniu.com/9yin/anonymous/find"+status+"Goods.do?serverId={serverId}&gameId={gameId}&typeNameParam={typeNameParam}"+urlSortWay+urlSortField+urlPageIndex+urlItemName+bwa+"&_={}",HttpMethod.GET,requestEntity,String.class,params);
        return responseEntity.getBody();
    }
    public String getServerList(){
        RestTemplate restTemplate=new RestTemplate(); //创建请求
        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("gameId","10");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("toServerList"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求
        ResponseEntity<String> responseEntity=restTemplate.exchange("http://jishi.woniu.com/9yin/loadServerList.do?gameId={gameId}&_={}",HttpMethod.GET,requestEntity,String.class,params);
        return responseEntity.getBody();
    }
    public String getFollowCount(String serverId, String itemIds){
        RestTemplate restTemplate=new RestTemplate(); //创建请求
        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("gameId","10");
        params.put("itemIds",itemIds);
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("anonymousPage"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求
        ResponseEntity<String> responseEntity=restTemplate.exchange("http://jishi.woniu.com/9yin/anonymous/getItemsFollowCount.do?serverId={serverId}&gameId={gameId}&itemIds={itemIds}&_={}",HttpMethod.GET,requestEntity,String.class,params);
        return responseEntity.getBody();
    }
}