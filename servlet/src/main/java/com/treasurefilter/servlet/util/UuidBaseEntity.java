package com.treasurefilter.servlet.util;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.id.UUIDGenerator;
import org.hibernate.type.StringType;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import java.util.Properties;

@MappedSuperclass
@Getter
@Setter
public class UuidBaseEntity {

//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "uuid", length = 40)
    @GeneratedValue(generator = "IDGenerator")
    @GenericGenerator(name = "IDGenerator", strategy = "org.hibernate.id.UUIDGenerator")
    protected String uuid;

    public boolean isNew() {
        return this.uuid == null;
    }

    public static String getNewUuid(){
        Properties props = new Properties();

        UUIDGenerator uuidGenerator = new UUIDGenerator();
        uuidGenerator.configure(StringType.INSTANCE, props, null);

        return ((String) uuidGenerator.generate(null, null)).toLowerCase();
    }

}
