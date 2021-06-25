import * as aws from "@pulumi/aws";
import { ComponentResource, ComponentResourceOptions, Output } from "@pulumi/pulumi";

export interface MandrillDnsArgs {
    zoneId: Output<string>
}

export class MandrillDns extends ComponentResource {
    constructor(name: string, args: MandrillDnsArgs, opts?: ComponentResourceOptions) {
        super("x:dns:mailgundns", name, opts);


        const dkimvalidationtxt = new aws.route53.Record("dkimvalidationtxt", {
            type: aws.route53.RecordType.TXT,
            zoneId: args.zoneId,
            ttl: 60,
            records: ["v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrLHiExVd55zd/IQ/J/mRwSRMAocV/hMB3jXwaHH36d9NaVynQFYV8NaWi69c1veUtRzGt7yAioXqLj7Z4TeEUoOLgrKsn8YnckGs9i3B3tVFB+Ch/4mPhXWiNfNdynHWBcPcbJ8kjEQ2U8y78dHZj1YeRXXVvWob2OaKynO8/lQIDAQAB;"],
            name: "mandrill._domainkey"
        });

        const mailValidationTxt = new aws.route53.Record("mailValidationTxt", {
            type: aws.route53.RecordType.TXT,
            zoneId: args.zoneId,
            ttl: 60,
            records: ["v=spf1 include:spf.mandrillapp.com ?all"],
            name: "piers.dev"
        });


    }
}
