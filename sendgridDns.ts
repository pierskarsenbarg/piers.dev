import * as aws from "@pulumi/aws";
import { ComponentResource, ComponentResourceOptions, Output } from "@pulumi/pulumi";

export interface SendGridDnsArgs {
    zoneId: Output<string>
}

export class SendGridDns extends ComponentResource {
    constructor(name: string, args: SendGridDnsArgs, opts?: ComponentResourceOptions) {
        super("x:dns:sendgriddns", name, opts);

        const mainCname = new aws.route53.Record("mainCname", {
            name: "em1539",
            type: aws.route53.RecordType.CNAME,
            ttl: 60,
            zoneId: args.zoneId,
            records: ["u22426074.wl075.sendgrid.net"]
        });

        const domainKey1 = new aws.route53.Record("domainKey1", {
            name: "s1._domainkey",
            type: aws.route53.RecordType.CNAME,
            ttl: 60,
            zoneId: args.zoneId,
            records: ["s1.domainkey.u22426074.wl075.sendgrid.net"]
        });

        const domainKey2 = new aws.route53.Record("domainKey2", {
            name: "s2._domainkey",
            type: aws.route53.RecordType.CNAME,
            ttl: 60,
            zoneId: args.zoneId,
            records: ["s2.domainkey.u22426074.wl075.sendgrid.net"]
        })
    }
}