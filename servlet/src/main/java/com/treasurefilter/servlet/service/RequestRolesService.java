package com.treasurefilter.servlet.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.treasurefilter.servlet.entity.*;
import com.treasurefilter.servlet.resultEntity.ServerResult;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

import static com.treasurefilter.servlet.entity.Wuxue.isGupuWuxue;
import static com.treasurefilter.servlet.entity.Wuxue.is99Wuxue;

@Service
public class RequestRolesService {
    private String woniuJishiUrl = "http://jishi.woniu.com/9yin/";
    private  List<ServerResult> serverList = findServerList();

    public List<ServerResult> findServerList(){
        RestTemplate restTemplate=new RestTemplate(); //创建请求
        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("gameId","10");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("toServerList"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求
        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl + "loadServerList.do?gameId={gameId}&_={_}", HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONArray serverArray = JSONArray.parseArray(jsonArray.get(0).toString());

        // 结果集
        List<ServerResult> results = new ArrayList<>();

        serverArray.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject)item;
            JSONArray gameServers = (JSONArray)itemJ.get("gameServers");
            gameServers.stream().forEach(server -> {
                JSONObject serverJ = (JSONObject)server;
                if(serverJ.get("parentId").equals(0)){
                    ServerResult serversResult = new ServerResult();
                    serversResult.setId(serverJ.get("id").toString());
                    serversResult.setName(serverJ.getString("areaName").toString() + "-" + serverJ.get("serverName").toString());
                    results.add(serversResult);
                }
            });
        });

        return results;
    }

    public List<Role> findRolesByName(String name, String serverId){
        List<Role> all = new ArrayList<>();
        List<Role> noticeRoleList = requestRolesByName(name, serverId,   1, "Notice");
        if(noticeRoleList != null){
            all.addAll(noticeRoleList);
        }
        List<Role> sellingRoleList = requestRolesByName(name, serverId,   1, "Selling");
        if(sellingRoleList != null){
            all.addAll(sellingRoleList);
        }
        return all;
    }

    public RoleContent getRoleContent(String serverId, String itemId){
        List<String> baowu = parseBaoWuBox(serverId,itemId);

        Map<String, ArrayList> equip = parseEquip(serverId, itemId);
        List<String> baowuOfBackpack = equip.get("baowuOfBackpack");
        List<String> threeSkills = equip.get("threeSkills");
        List<String> twoSkills = equip.get("twoSkills");
        List<String> wawa = equip.get("wawa");
        List<String> wawaOfBackpack = equip.get("wawaOfBackpack");

        List<Neigong> neigongs = parseNeigong(serverId,itemId);

        Map<String, ArrayList> wuxue = parseWuxue(serverId, itemId);
        List<Wuxue> gupuWuxues = wuxue.get("gupuWuxues");
        List<Wuxue> _99Wuxues = wuxue.get("_99Wuxues");

        List<Jingmai> jingmais = parseJingmai(serverId,itemId);
        List<UseCardRec> useCardRecList = parseUseCardRec(serverId,itemId);
        List<String> mounts = parseMount(serverId,itemId);

        return new RoleContent(baowu,baowuOfBackpack,threeSkills,twoSkills,wawa,wawaOfBackpack,neigongs,gupuWuxues,_99Wuxues,jingmais,useCardRecList,mounts);
    }

    public List<Role> requestRolesByName(String name, String serverId, int pageIndex, String status){
        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("gameId","10");
        params.put("auctionFirst","1");
        params.put("filterItem","4");
        params.put("pageIndex",String.valueOf(pageIndex));
        params.put("itemName",name);
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("anonymousPage"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "anonymous/find" + status + "Goods.do?"
                        + "serverId={serverId}&gameId={gameId}&auctionFirst={auctionFirst}&filterItem={filterItem}&pageIndex={pageIndex}&itemName={itemName}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONObject pageInfo = (JSONObject) object.get("pageInfo");

        int totalCount = (int) pageInfo.get("totalCount");
        int totalPages = (int) pageInfo.get("totalPages");
        int pageId = (int) pageInfo.get("pageId");

        if(totalCount == 0){
            return null;
        }

        JSONArray pageData = (JSONArray) object.get("pageData");

        ArrayList<Role> roles = new ArrayList<>();

        pageData.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject)item;
            Role role = new Role();
            role.setId(itemJ.get("id").toString());
            role.setName(itemJ.get("itemName").toString());
            role.setGrade(itemJ.getString("grade").toString().length()<4?itemJ.getString("gradeName").toString():itemJ.getString("grade").toString());
            role.setGender(itemJ.get("gender").toString());
            role.setPrice(itemJ.get("price").toString());
            role.setStatus(status.equals("Notice")?"公示期":"在售");
            role.setNeigongyanxiu(parseNeigongyanxiu(serverId,role.getId()));
            role.setSchool(parseSchool(serverId,role.getId()));
            role.setServer(getServerName(serverId));

            roles.add(role);
        });

        if(pageId<totalPages){
            List<Role> roleList = requestRolesByName(name, serverId, pageId + 1, status);
            roles.addAll(roleList);
        }

        return roles;
    }

    public String parseNeigongyanxiu(String serverId, String itemId){
        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("itemId",itemId);
        params.put("type","OtherProp");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        String msg = object.get("msg").toString();

        int beg = msg.indexOf("内功研修") + 6;
        int end = msg.indexOf("武学") - 4;
        String neigongyanxiu = msg.substring(beg,end);

        if (neigongyanxiu.length()>4) {
            neigongyanxiu = neigongyanxiu.substring(0,neigongyanxiu.length()-4) + "亿" + neigongyanxiu.substring(neigongyanxiu.length()-4,neigongyanxiu.length()) + "万";
        }
        else {
            neigongyanxiu = neigongyanxiu + "万";
        }

        return neigongyanxiu;
    }

    public String parseSchool(String serverId, String itemId){
        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("itemId",itemId);
        params.put("type","NeiGongContainer");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONArray msg = JSONArray.parseArray(object.get("msg").toString());

        AtomicReference<String> school = new AtomicReference<>("");

        msg.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject)item;
            String neigongName = itemJ.getString("name");

            if(neigongName.equals("淇奥诀") || neigongName.equals("风起诀") || neigongName.equals("昆仑引") || neigongName.equals("昆仑会意功")){
                school.set("昆仑");
                return;
            }
            else if(neigongName.equals("冰肌玉骨功") || neigongName.equals("大乘涅磐功") || neigongName.equals("心莲无量功") || neigongName.equals("峨眉会意功")){
                school.set("峨眉");
                return;
            }
            else if(neigongName.equals("魔相诀") || neigongName.equals("拍影功") || neigongName.equals("噬月神鉴") || neigongName.equals("极乐会意功")){
                school.set("极乐");
                return;
            }
            else if(neigongName.equals("酒雨神功") || neigongName.equals("伏龙诀") || neigongName.equals("一气海纳功") || neigongName.equals("丐帮会意功")){
                school.set("丐帮");
                return;
            }
            else if(neigongName.equals("纯阳无极功") || neigongName.equals("齐天真罡") || neigongName.equals("太极神功") || neigongName.equals("武当会意功")){
                school.set("武当");
                return;
            }
            else if(neigongName.equals("葬花玄功录") || neigongName.equals("九天凤舞仙诀") || neigongName.equals("溪月花香集") || neigongName.equals("君子会意功")){
                school.set("君子");
                return;
            }
            else if(neigongName.equals("太素玄阴经") || neigongName.equals("断脉逆心功") || neigongName.equals("九转天邪经") || neigongName.equals("唐门会意功")){
                school.set("唐门");
                return;
            }
            else if(neigongName.equals("混天宝纲") || neigongName.equals("地狱换魂经") || neigongName.equals("修罗武经") || neigongName.equals("锦衣会意功")){
                school.set("锦衣");
                return;
            }
            else if(neigongName.equals("旃檀心经") || neigongName.equals("洗髓经") || neigongName.equals("灭相禅功") || neigongName.equals("少林会意功")){
                school.set("少林");
                return;
            }
            else if(neigongName.equals("燎原神功") || neigongName.equals("明王宝策") || neigongName.equals("移天焚海诀") || neigongName.equals("明教会意功")){
                school.set("明教");
                return;
            }
            else if(neigongName.equals("梅影抄") || neigongName.equals("云天谱") || neigongName.equals("雷音神典") || neigongName.equals("天山会意功")){
                school.set("天山");
                return;
            }
        });

        if(school.toString().length() == 0){
            school.set("未知");
        }

        return school.toString();
    }

    public List<Neigong> parseNeigong(String serverId, String itemId){
        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("itemId",itemId);
        params.put("type","NeiGongContainer");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONArray msg = JSONArray.parseArray(object.get("msg").toString());

        ArrayList<Neigong> neigongs = new ArrayList<>();

        msg.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject) item;
            String name = itemJ.getString("name");
            String info = itemJ.getString("dataInfo");
            String type = info.substring(info.indexOf("归属：")+3, info.indexOf("功力：")-4);
            String level = info.substring(info.indexOf("功力：")+3, info.indexOf("<br><font"));
            Neigong neigong = new Neigong(name, type, level);
            neigongs.add(neigong);
        });

        // 按内功类型排序
        neigongs.sort(Comparator.comparing(item->{
            return item.type;
        }));

        return neigongs;
    }

    public Map<String, ArrayList> parseWuxue(String serverId, String itemId){
        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("itemId",itemId);
        params.put("type","SkillContainer");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONArray msg = JSONArray.parseArray(object.get("msg").toString());

        ArrayList<Wuxue> gupuWuxues = new ArrayList<>();
        ArrayList<Wuxue> _99Wuxues = new ArrayList<>();

        msg.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject) item;
            String type = itemJ.getString("type");
            if(isGupuWuxue(type)){
                String name = itemJ.getString("name");
                String info = itemJ.getString("dataInfo");
                String level = info.substring(info.indexOf("功力：")+3, info.indexOf("层）<br>")) + "层）";
                Wuxue gupuWuxue = new Wuxue(name,type,level);
                gupuWuxues.add(gupuWuxue);
            }
            else if(is99Wuxue(type)){
                String name = itemJ.getString("name");
                String info = itemJ.getString("dataInfo");
                String level = info.substring(info.indexOf("功力：")+3, info.indexOf("层）<br>")) + "层）";
                Wuxue _99Wuxue = new Wuxue(name,type,level);
                _99Wuxues.add(_99Wuxue);
            }
            else if(type.equals("江湖散招/江湖散手") && itemJ.getString("name").equals("神行百变")){
                String name = itemJ.getString("name");
                String info = itemJ.getString("dataInfo");
                String level = info.substring(info.indexOf("功力：")+3, info.indexOf("层）<br>")) + "层）";
                Wuxue shenxing = new Wuxue(name,"徒手套路/野球拳（"+type+"）",level);
                gupuWuxues.add(shenxing);
            }
        });

        gupuWuxues.sort(Comparator.comparing(item->{
            return item.type;
        }));

        _99Wuxues.sort(Comparator.comparing(item->{
            return item.type;
        }));

        Map<String, ArrayList> result = new HashMap<>(); //创建结果集
        result.put("gupuWuxues",gupuWuxues);
        result.put("_99Wuxues",_99Wuxues);

        return result;
    }

    public List<Jingmai> parseJingmai(String serverId, String itemId){
        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("itemId",itemId);
        params.put("type","JingMaiContainer");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONArray msg = JSONArray.parseArray(object.get("msg").toString());

        ArrayList<Jingmai> jingmais = new ArrayList<>();

        msg.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject) item;
            String name = itemJ.getString("name");
            String info = itemJ.getString("dataInfo");
            String level = info.substring(info.indexOf("已修炼至：")+5, info.indexOf("周天")) + "周天";
            String school = "";
            if(info.contains("主修")){
                school = info.substring(info.indexOf("[推荐")+3, info.indexOf("主修"));
            }
            String qizhen = "";
            if(info.contains("奇珍效果")){
                qizhen = info.substring(info.indexOf("奇珍效果：</font><br>")+16, info.indexOf("</div></div></div>"));
                qizhen = qizhen.replace("<br>"," ");
            }
            Jingmai jingmai = new Jingmai(name,level,school,qizhen);
            jingmais.add(jingmai);
        });

        jingmais.sort(Comparator.comparing(item->{
            return item.name;
        }));

        return jingmais;
    }

    public List<String> parseBaoWuBox(String serverId, String itemId){
        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("itemId",itemId);
        params.put("type","BaoWuBox");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONArray msg = JSONArray.parseArray(object.get("msg").toString());

        ArrayList baoWuBox = new ArrayList<>();

        msg.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject) item;
            String info = itemJ.getString("dataInfo");
            baoWuBox.add(info);
        });

        return baoWuBox;
    }

    public Map<String, ArrayList> parseEquip(String serverId, String itemId){
        ArrayList wawa = new ArrayList<>();
        ArrayList wawaOfBackpack = new ArrayList<>();

        ArrayList baowuOfBackpack = new ArrayList<>();

        ArrayList threeSkills = new ArrayList<>();
        ArrayList twoSkills = new ArrayList<>();

        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("itemId",itemId);
        params.put("type","EquipBox");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONArray msg = JSONArray.parseArray(object.get("msg").toString());

        msg.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject) item;
            String info = itemJ.getString("dataInfo");
            String itemType = itemJ.getString("itemType");

            // 娃娃
            if(itemType.equals("193")){
                wawa.add(info);
            }
            // 背包宝物
            else if(itemType.equals("146")){
                baowuOfBackpack.add(info);
            }
            // 装备武器
            else {
                SAXReader reader = new SAXReader();
                Document document = null;
                try {
                    try {
                        document = reader.read(new ByteArrayInputStream(info.replace("<br>","").getBytes("UTF-8")));
                    } catch (UnsupportedEncodingException e) {
                        e.printStackTrace();
                        return;
                    }
                } catch (DocumentException e) {
                    e.printStackTrace();
                    return;
                }
                List<Element> elementList = document.selectNodes("//font[@color1=\"#eb6100\"]");

                if(elementList.size() >= 6){
                    if(elementList.get(1).getTextTrim().equals(elementList.get(3).getTextTrim()) && elementList.get(3).getTextTrim().equals(elementList.get(5).getTextTrim())){
                        threeSkills.add(info);
                    }
                    else{
                        if(elementList.get(1).getTextTrim().equals(elementList.get(3).getTextTrim()) || elementList.get(1).getTextTrim().equals(elementList.get(5).getTextTrim()) || elementList.get(3).getTextTrim().equals(elementList.get(5).getTextTrim())){
                            twoSkills.add(info);
                        }
                    }
                }
            }
        });

        RestTemplate restTemplate2 = new RestTemplate(); //创建请求

        Map<String,String> params2 = new HashMap<>(); //创建参数表
        params2.put("serverId",serverId);
        params2.put("itemId",itemId);
        params2.put("type","EquipToolBox");
        long timestamp2 = new Date().getTime(); //13位的时间戳
        params2.put("_",Long.toString(timestamp2));

        genHttpHeaders requestHeaders2 = new genHttpHeaders();
        HttpHeaders headers2 = requestHeaders2.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity2 = new HttpEntity<>(null, headers2);//将header放入一个请求

        ResponseEntity<String> responseEntity2 = restTemplate2.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity2,String.class,params2);
        String content2 = responseEntity2.getBody();

        JSONArray jsonArray2= JSONArray.parseArray(content2);

        JSONObject object2 = (JSONObject) jsonArray2.get(0);

        JSONArray msg2 = JSONArray.parseArray(object2.get("msg").toString());

        msg2.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject) item;
            String info = itemJ.getString("dataInfo");
            String itemType = itemJ.getString("itemType");

            // 娃娃
            if(itemType.equals("193")){
                wawaOfBackpack.add(info);
            }
            // 背包宝物
            else if(itemType.equals("146")){
                baowuOfBackpack.add(info);
            }
            // 装备武器
            else{
                SAXReader reader = new SAXReader();
                Document document = null;
                try {
                    try {
                        document = reader.read(new ByteArrayInputStream(info.replace("<br>","").getBytes("UTF-8")));
                    } catch (UnsupportedEncodingException e) {
                        e.printStackTrace();
                        return;
                    }
                } catch (DocumentException e) {
                    e.printStackTrace();
                    return;
                }
                List<Element> elementList = document.selectNodes("//font[@color1=\"#eb6100\"]");

                if(elementList.size() >= 6){
                    if(elementList.get(1).getTextTrim().equals(elementList.get(3).getTextTrim()) && elementList.get(3).getTextTrim().equals(elementList.get(5).getTextTrim())){
                        threeSkills.add(info);
                    }
                    else{
                        if(elementList.get(1).getTextTrim().equals(elementList.get(3).getTextTrim()) || elementList.get(1).getTextTrim().equals(elementList.get(5).getTextTrim()) || elementList.get(3).getTextTrim().equals(elementList.get(5).getTextTrim())){
                            twoSkills.add(info);
                        }
                    }
                }
            }
        });

        Map<String, ArrayList> result = new HashMap<>(); //创建结果集
        result.put("threeSkills",threeSkills);
        result.put("twoSkills",twoSkills);
        result.put("wawa",wawa);
        result.put("wawaOfBackpack",wawaOfBackpack);
        result.put("baowuOfBackpack",baowuOfBackpack);
        
        return result;
    }

    public List<String> parseMount(String serverId, String itemId){
        RestTemplate restTemplate=new RestTemplate(); //创建请求

        Map<String,String> params=new HashMap<>(); //创建参数表
        params.put("serverId",serverId);
        params.put("itemId",itemId);
        params.put("type","ToolBox");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_",Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity=restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET,requestEntity,String.class,params);
        String content = responseEntity.getBody();

        JSONArray jsonArray= JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONArray msg = JSONArray.parseArray(object.get("msg").toString());

        List mounts = new ArrayList<>();

        msg.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject) item;
            String info = itemJ.getString("dataInfo");
            String itemType = itemJ.getString("itemType");
            String name = itemJ.getString("name");
            if(itemType.equals("200") && !name.startsWith("马哨")){
                mounts.add(info);
            }
        });

        return mounts;
    }

    public List<UseCardRec> parseUseCardRec(String serverId, String itemId) {
        RestTemplate restTemplate = new RestTemplate(); //创建请求

        Map<String, String> params = new HashMap<>(); //创建参数表
        params.put("serverId", serverId);
        params.put("itemId", itemId);
        params.put("type", "UseCardRec");
        long timestamp = new Date().getTime(); //13位的时间戳
        params.put("_", Long.toString(timestamp));

        genHttpHeaders requestHeaders = new genHttpHeaders();
        HttpHeaders headers = requestHeaders.gen("roles"); //生成请求头
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);//将header放入一个请求

        ResponseEntity<String> responseEntity = restTemplate.exchange(woniuJishiUrl
                        + "roleMsgInfo.do?"
                        + "serverId={serverId}&itemId={itemId}&type={type}&_={_}",
                HttpMethod.GET, requestEntity, String.class, params);
        String content = responseEntity.getBody();

        JSONArray jsonArray = JSONArray.parseArray(content);

        JSONObject object = (JSONObject) jsonArray.get(0);

        JSONArray msg = JSONArray.parseArray(object.get("msg").toString());

        ArrayList<UseCardRec> useCardRecList = new ArrayList<>();

        msg.stream().forEach(item -> {
            JSONObject itemJ = (JSONObject) item;
            String info = itemJ.getString("dataInfo");
            String name = itemJ.getString("name");
            String photo = itemJ.getString("photo");
            String quality = info.substring(info.indexOf("品质:")+3,info.indexOf("品质:")+5);
            String type = "";

            SAXReader reader = new SAXReader();
            Document document = null;
            try {
                document = reader.read(new ByteArrayInputStream(info.replace("<br>","").getBytes("UTF-8")));
            } catch (DocumentException e) {
                e.printStackTrace();
                return;
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
                return;
            }
            Node node = document.selectSingleNode("//font[@color=\"#FFFFFF\"]");
            if(node!=null){
                type = node.getText();
            }
            else {
                type = info.substring(info.indexOf("类型:")+3,info.indexOf("品质:")-4);
            }

            UseCardRec useCardRec = new UseCardRec(name,type,quality,photo);
            useCardRecList.add(useCardRec);
        });

        useCardRecList.sort(Comparator.comparing(item->{
            return item.type;
        }));

        return useCardRecList;
    }

    public ServerResult getServerName(String serverId){
        ServerResult server = new ServerResult();
        serverList.forEach(item -> {
            if(item.id.equals(serverId)){
                server.setId(item.id);
                server.setName(item.name);
                return;
            }
        });
        return server;
    }
}
