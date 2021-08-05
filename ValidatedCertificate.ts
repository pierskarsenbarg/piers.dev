import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface ValidatedCertificateArgs {
    domainName: string,
    hostedZoneId: pulumi.Output<string>,
}

export class ValidatedCertificate extends pulumi.ComponentResource {
    public readonly CertificateArn: pulumi.Output<string>;
    constructor(name: string, args: ValidatedCertificateArgs, opts?: pulumi.ComponentResource) {
        super("x:aws:validatedcertificate", name, opts);

        const eastRegion = new aws.Provider(`${name}-useast1-provider`, {
            region: "us-east-1", // Per AWS, ACM certificate must be in the us-east-1 region.
        }, { parent: this });

        const certificate = new aws.acm.Certificate("cert", {
            domainName: args.domainName,
            subjectAlternativeNames: [`*.${args.domainName}`],
            validationMethod: "DNS",
            tags: {
                Name: args.domainName
            }
        }, { provider: eastRegion, parent: this });

        const certValidationRecord = new aws.route53.Record("certValidationRecord", {
            name: certificate.domainValidationOptions[0].resourceRecordName,
            zoneId: args.hostedZoneId,
            type: certificate.domainValidationOptions[0].resourceRecordType,
            records: [certificate.domainValidationOptions[0].resourceRecordValue],
            ttl: 60
        }, { parent: this });

        const certValidation = new aws.acm.CertificateValidation("certValidation", {
            certificateArn: certificate.arn,
            validationRecordFqdns: [certValidationRecord.fqdn]
        }, { provider: eastRegion, parent: this });

        this.CertificateArn = certificate.arn;

        this.registerOutputs({
            CertificateArn: this.CertificateArn
        });
    }
}