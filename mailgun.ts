import * as aws from "@pulumi/aws";
import { ComponentResource, ComponentResourceOptions, Output } from "@pulumi/pulumi";

export interface MailgunDnsArgs {
    zoneId: Output<string>
}

export class MailgunDns extends ComponentResource {
    constructor(name: string, args: MailgunDnsArgs, opts?: ComponentResourceOptions) {
        super("x:dns:mailgundns", name, opts);

        const mailValidationTxt = new aws.route53.Record("mailValidationTxt", {
            type: aws.route53.RecordType.TXT,
            zoneId: args.zoneId,
            ttl: 60,
            records: ["v=spf1 include:mailgun.org ~all"],
            name: "from.piers.dev"
        });
        
        const mailValidationTxtSecure = new aws.route53.Record("mailValidationTxtSecure", {
            type: aws.route53.RecordType.TXT,
            zoneId: args.zoneId,
            ttl: 60,
            records: ["k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDJoW5s2j+hogRtSiPdtmi/y+QmFLU7eVUv6p+AL92jEHZKn8yFYiaGLzmgbYGwowV6E9uQxX2StsQ0WJGGTMvpsFyEJyQ4Jxcmja6Q0BAItVGbEPBGl0Oq0sEklsUxVzFH5tUluiK+FA1xxvaiVUFow8z+6vjvOBIaFZl+JQW9bwIDAQAB"],
            name: "s1._domainkey.from.piers.dev"
        });
        
        const mailValidationMxA = new aws.route53.Record("mailValidationMxA", {
            type: aws.route53.RecordType.MX,
            name: "from.piers.dev",
            records: [
                "10 mxa.eu.mailgun.org",
                "10 mxb.eu.mailgun.org"
            ],
            ttl: 60,
            zoneId: args.zoneId
        });
        
        const mailGunCname = new aws.route53.Record("mailGunCname", {
            type: aws.route53.RecordType.CNAME,
            ttl: 60,
            name: "email.from.piers.dev",
            records: ["eu.mailgun.org"],
            zoneId: args.zoneId
        })
    }
}