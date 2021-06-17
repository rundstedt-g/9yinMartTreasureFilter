package com.treasurefilter.servlet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins =  {"http://localhost:8000", "http://localhost:8001","http://localhost:8002", "http://47.116.134.96:3002", "http://roles.rundstedt.cn"})
public class GetRoles {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Value("${scrapy-roleByFilter-endTxt}") String endTxt;

    @RequestMapping(value="/byTreasure", method= RequestMethod.GET)
    public List searchByTreasure(@RequestParam(value = "bwa1",required = false,defaultValue = "") String bwa1,
                                 @RequestParam(value = "bwa2",required = false,defaultValue = "") String bwa2,
                                 @RequestParam(value = "bwa3",required = false,defaultValue = "") String bwa3,
                                 @RequestParam(value = "bwa4",required = false,defaultValue = "") String bwa4,
                                 @RequestParam(value = "bwa5",required = false,defaultValue = "") String bwa5,
                                 @RequestParam(value = "skill",required = false,defaultValue = "") String skill,
                                 @RequestParam(value = "is750",required = false,defaultValue = "false") String is750,
                                 @RequestParam(value = "server",required = false,defaultValue = "") String server)throws IOException {

        String sql = "";
        String serversql = "";

        if(!server.equals("")){
            serversql = "WHERE role.server = '" + server + "'";
        }

        // 无参情况
        if(bwa1.equals("") && bwa2.equals("") && bwa3.equals("") && bwa4.equals("") && bwa5.equals("") && skill.equals("") && is750.equals("false")){
            sql = "SELECT * FROM role " + serversql + " ORDER BY role.price";
        }
        // 有参
        else{
            String paramSql = "";
            String paramCountSql = "";
            String skillSql = skill.equals("") ? "" : "AND treasure.skill='"+skill+"' ";
            String is750sql = is750.equals("false") ? "" : "AND treasure.is750=TRUE ";
            String clause1 = "";
            String clause2 = "";

            // 只根据宝物表查询，不涉及宝物属性表的情况
            if(bwa1.equals("") && bwa2.equals("") && bwa3.equals("") && bwa4.equals("") && bwa5.equals("")){
                clause1 = "FROM treasure WHERE ";
                //skill 和 is750 一定至少有一个非空
                if(skill.equals("")){  //skill空 is750非空
                    is750sql = "treasure.is750=TRUE ";
                }
                else{ //skill 非空
                    skillSql= "treasure.skill='"+skill+"' ";
                }
                clause2 = "";
            }
            else{
                clause1 = "FROM treasure,treasureprop WHERE treasure.tID=treasureprop.tID ";
                clause2 = "GROUP BY treasure.tID HAVING COUNT(treasure.tID)>";
            }

            if(!bwa1.equals("")) {
                paramSql = "AND (treasureprop.prop LIKE '" + bwa1 + "%'";
                paramCountSql = "0";
                if(!bwa2.equals("")){
                    paramSql += " OR treasureprop.prop LIKE '" + bwa2 + "%'";
                    paramCountSql = "1";
                    if(!bwa3.equals("")){
                        paramSql += " OR treasureprop.prop LIKE '" + bwa3 + "%'";
                        paramCountSql = "2";
                        if(!bwa4.equals("")){
                            paramSql += " OR treasureprop.prop LIKE '" + bwa4 + "%'";
                            paramCountSql = "3";
                            if(!bwa5.equals("")){
                                paramSql += " OR treasureprop.prop LIKE '" + bwa5 + "%'";
                                paramCountSql = "4";
                            }
                        }
                    }
                }
                paramSql += ") ";
            }

            if(!server.equals("")){
                serversql = "AND role.server = '" + server + "' ";
            }
            else {
                serversql = "";
            }

            // 组合sql语句
            sql = "SELECT tmp.roleID,role.name,role.gender,role.school,role.neigongyanxiu,role.price,role.status,role.server " +
                    "FROM (SELECT treasure.`roleID` " +
                     clause1 + skillSql + is750sql + paramSql +
                     clause2 + paramCountSql + ") AS tmp ,role " +
                    "WHERE tmp.roleID = role.roleID " + serversql +
                    "GROUP BY tmp.roleID " +
                    "HAVING COUNT(tmp.roleID)>4 " +
                    "ORDER BY role.price";
        }
        System.out.println(sql);
        List response = jdbcTemplate.queryForList(sql); //执行 sql查询
        return response;
    }

    @RequestMapping(value="/byThreeSkills", method= RequestMethod.GET)
    public List searchByThreeSkills(@RequestParam(value = "wx1",required = false,defaultValue = "") String wx1,
                                      @RequestParam(value = "ts1",required = false,defaultValue = "") String ts1,
                                      @RequestParam(value = "wx2",required = false,defaultValue = "") String wx2,
                                      @RequestParam(value = "ts2",required = false,defaultValue = "") String ts2,
                                      @RequestParam(value = "wx3",required = false,defaultValue = "") String wx3,
                                      @RequestParam(value = "ts3",required = false,defaultValue = "") String ts3,
                                      @RequestParam(value = "wx4",required = false,defaultValue = "") String wx4,
                                      @RequestParam(value = "ts4",required = false,defaultValue = "") String ts4,
                                      @RequestParam(value = "wx5",required = false,defaultValue = "") String wx5,
                                      @RequestParam(value = "ts5",required = false,defaultValue = "") String ts5,
                                      @RequestParam(value = "server",required = false,defaultValue = "") String server)throws IOException {

        String sql = "";
        String clause = "";
        String count = "";
        String serversql = "";

        if(!server.equals("")){
            serversql = "WHERE role.server = '" + server + "'";
        }

        // 无参情况
        if(wx1.equals("") && wx2.equals("") && wx3.equals("") && wx4.equals("") && wx5.equals("")){
            sql = "SELECT * FROM role " + serversql + " ORDER BY role.price";
        }
        // 有参
        else{
            if(!wx1.equals("")) {
                clause += "((threeskills.`wuxue`='" + wx1 + "' AND threeskills.`skill`='" + ts1 + "')";
                count = "0";
                if(!wx2.equals("")){
                    clause += " OR (threeskills.`wuxue`='" + wx2 + "' AND threeskills.`skill`='" + ts2 + "')";
                    count = "1";
                    if(!wx3.equals("")){
                        clause += " OR (threeskills.`wuxue`='" + wx3 + "' AND threeskills.`skill`='" + ts3 + "')";
                        count = "2";
                        if(!wx4.equals("")){
                            clause += " OR (threeskills.`wuxue`='" + wx4 + "' AND threeskills.`skill`='" + ts4 + "')";
                            count = "3";
                            if(!wx5.equals("")) {
                                clause += " OR (threeskills.`wuxue`='" + wx5 + "' AND threeskills.`skill`='" + ts5 + "')";
                                count = "4";
                            }
                        }
                    }
                }
                clause += ") ";
            }

            if(!server.equals("")){
                serversql = "AND role.server = '" + server + "' ";
            }
            else {
                serversql = "";
            }

            sql = "SELECT role.roleID,role.name,role.gender,role.school,role.neigongyanxiu,role.price,role.status,role.server " +
                    "FROM role,threeskills " +
                    "WHERE role.`roleID`=threeskills.`roleID` AND " +
                    clause + serversql +
                    "GROUP BY role.roleID " +
                    "HAVING COUNT(role.roleID)>" + count +
                    " ORDER BY role.price";

        }
        System.out.println(sql);
        List response = jdbcTemplate.queryForList(sql);

        return response;
    }

    @RequestMapping(value="/bySkin", method= RequestMethod.GET)
    public List searchBySkin(@RequestParam(value = "skin1",required = false,defaultValue = "") String skin1,
                               @RequestParam(value = "skin2",required = false,defaultValue = "") String skin2,
                               @RequestParam(value = "skin3",required = false,defaultValue = "") String skin3,
                               @RequestParam(value = "skin4",required = false,defaultValue = "") String skin4,
                               @RequestParam(value = "skin5",required = false,defaultValue = "") String skin5,
                               @RequestParam(value = "server",required = false,defaultValue = "") String server)throws IOException {

        String sql = "";
        String clause = "";
        String count = "";
        String serversql = "";

        if(!server.equals("")){
            serversql = "WHERE role.server = '" + server + "'";
        }

        // 无参情况
        if(skin1.equals("") && skin2.equals("") && skin3.equals("") && skin4.equals("") && skin5.equals("")){
            sql = "SELECT * FROM role " + serversql + " ORDER BY role.price";
        }
        // 有参
        else {
            if (!skin1.equals("")) {
                clause += "(skin.name LIKE'" + skin1 + "%'";
                count = "0";
                if (!skin2.equals("")) {
                    clause += " OR skin.name LIKE'" + skin2 + "%'";
                    count = "1";
                    if (!skin3.equals("")) {
                        clause += " OR skin.name LIKE'" + skin3 + "%'";
                        count = "2";
                        if (!skin4.equals("")) {
                            clause += " OR skin.name LIKE'" + skin4 + "%'";
                            count = "3";
                            if (!skin5.equals("")) {
                                clause += " OR skin.name LIKE'" + skin5 + "%'";
                                count = "4";
                            }
                        }
                    }
                }
                clause += ") ";
            }

            if(!server.equals("")){
                serversql = "AND role.server = '" + server + "' ";
            }
            else {
                serversql = "";
            }

            sql = "SELECT role.roleID,role.name,role.gender,role.school,role.neigongyanxiu,role.price,role.status,role.server " +
                    "FROM role,skin " +
                    "WHERE role.`roleID`=skin.`roleID` AND " +
                    clause + serversql +
                    "GROUP BY role.roleID " +
                    "HAVING COUNT(role.roleID)>" + count +
                    " ORDER BY role.price";
        }
        System.out.println(sql);
        List response = jdbcTemplate.queryForList(sql);

        return response;
    }

    @RequestMapping(value="/getRole", method= RequestMethod.GET)
    public Map searchBySkin(@RequestParam(value = "id") String id)throws IOException {
        String treasureSql = "SELECT * FROM treasure WHERE treasure.roleID=" + id;
        List treasure = jdbcTemplate.queryForList(treasureSql);
        String threeSkillsSql = "SELECT * FROM threeskills WHERE threeskills.roleID=" + id;
        List threeSkills = jdbcTemplate.queryForList(threeSkillsSql);
        String skinSql = "SELECT * FROM skin WHERE skin.roleID=" + id;
        List skin = jdbcTemplate.queryForList(skinSql);

        Map response = new HashMap();
        response.put("treasure",treasure);
        response.put("threeSkills",threeSkills);
        response.put("skin",skin);

        return response;
    }

    @RequestMapping(value="/isMaintenance", method= RequestMethod.GET)
    public Map isMaintenance()throws IOException {
        Map response = new HashMap();

        try {
            File txtFile = new File(endTxt);
            InputStreamReader reader = new InputStreamReader(new FileInputStream(txtFile)); // 建立一个输入流对象reader
            BufferedReader br = new BufferedReader(reader); // 建立一个对象，它把文件内容转成计算机能读懂的语言

            String endTime = br.readLine(); // 第一行是爬虫结束时间
            String endSignal = br.readLine(); // 第二行是爬虫结束信号

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime parseTime = LocalDateTime.parse(endTime, dtf);

            LocalDateTime nowTime = LocalDateTime.now(); // 当前时间

            if(nowTime.isAfter(parseTime) && endSignal.equals("finished")){
                response.put("time",endTime);
                response.put("isMaintenance",false);
            }
            else {
                response.put("isMaintenance",true);
            }
            br.close();
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping(value="/byName")
    @ResponseStatus(HttpStatus.OK)
    public List findByName(@RequestParam(value = "name",required = false,defaultValue = "") String name,
                           @RequestParam(value = "server",required = false,defaultValue = "") String server){
        String clause = "";
        if(!name.equals("") || !server.equals("")){
            clause += "WHERE ";
        }

        if(!name.equals("")){
            clause += "role.`name` LIKE '%"+ name +"%' ";
        }

        if(!server.equals("")){
            String andChar = "";
            if(!name.equals("")){
                andChar += "AND ";
            }
            clause += andChar + "role.server = '" + server + "' ";
        }

        String sql = "SELECT * FROM role " + clause + "ORDER BY role.price";

        System.out.println(sql);
        List response = jdbcTemplate.queryForList(sql);
        return response;
    }

    @GetMapping(value="/getServers")
    @ResponseStatus(HttpStatus.OK)
    public List getServers(){
        String sql = "SELECT (@sn :=@sn + 1) sn, a.server FROM (SELECT DISTINCT role.`server` FROM role) a,(SELECT @sn :=0) b";
        List response = jdbcTemplate.queryForList(sql);
        return response;
    }
}
