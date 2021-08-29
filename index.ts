import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";
import * as mime from "mime";
import * as utils from "./utils";

import { ValidatedCertificate } from "./ValidatedCertificate";

const stackConfig = new pulumi.Config();

const config = {
    blogFolder: stackConfig.require("blogFolder"),
    domainName: stackConfig.require("domainName")
}

const siteBucket = new aws.s3.Bucket("piers.dev", {
    acl: "public-read",
    website: {
        indexDocument: "index.html"
    },
    bucket: config.domainName
});

// Sync the contents of the source directory with the S3 bucket, which will in-turn show up on the CDN.
const webContentsRootPath = path.join(process.cwd(), config.blogFolder);
utils.crawlDirectory(
    webContentsRootPath,
    (filePath: string) => {
        const relativeFilePath = filePath.replace(webContentsRootPath + "/", "");
        new aws.s3.BucketObject(
            relativeFilePath,
            {
                key: relativeFilePath,
                acl: "public-read",
                bucket: siteBucket,
                contentType: mime.getType(filePath) || undefined,
                source: new pulumi.asset.FileAsset(filePath),
            },
            {
                parent: siteBucket,
            });
    });

const logsBucket = new aws.s3.Bucket("piersdevrequestLogs", {
    acl: "private",
});

const hostedZone = new aws.route53.Zone("piersdev-hostedzone", {
    name: config.domainName
});

const cacheTimeout = 30;

const validatedCertificate = new ValidatedCertificate("piers.dev-validated-cert", {
    domainName: "piers.dev",
    hostedZoneId: hostedZone.zoneId
});

// const eastRegion = new aws.Provider("east", {
//     region: "us-east-1", // Per AWS, ACM certificate must be in the us-east-1 region.
// });

// const certificate = new aws.acm.Certificate("cert", {
//     domainName: config.domainName,
//     subjectAlternativeNames: [`*.${config.domainName}`],
//     validationMethod: "DNS",
//     tags: {
//         Name: "piers.dev"
//     }
// }, { provider: eastRegion });

// const certValidationRecord = new aws.route53.Record("certValidationRecord", {
//     name: certificate.domainValidationOptions[0].resourceRecordName,
//     zoneId: hostedZone.zoneId,
//     type: certificate.domainValidationOptions[0].resourceRecordType,
//     records: [certificate.domainValidationOptions[0].resourceRecordValue],
//     ttl: 60
// }, { parent: hostedZone })

// const certValidation = new aws.acm.CertificateValidation("certValidation", {
//     certificateArn: certificate.arn,
//     validationRecordFqdns: [certValidationRecord.fqdn]
// }, { provider: eastRegion });

const cdn = new aws.cloudfront.Distribution("cdn", {
    enabled: true,
    // Alternate aliases the CloudFront distribution can be reached at, in addition to https://xxxx.cloudfront.net.
    // Required if you want to access the distribution via config.targetDomain as well.
    aliases: [config.domainName],

    // We only specify one origin for this distribution, the S3 content bucket.
    origins: [
        {
            originId: siteBucket.arn,
            domainName: siteBucket.websiteEndpoint,
            customOriginConfig: {
                // Amazon S3 doesn't support HTTPS connections when using an S3 bucket configured as a website endpoint.
                // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesOriginProtocolPolicy
                originProtocolPolicy: "http-only",
                httpPort: 80,
                httpsPort: 443,
                originSslProtocols: ["TLSv1.2"],
            },
        },
    ],

    defaultRootObject: "index.html",

    // A CloudFront distribution can configure different cache behaviors based on the request path.
    // Here we just specify a single, default cache behavior which is just read-only requests to S3.
    defaultCacheBehavior: {
        targetOriginId: siteBucket.arn,

        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],

        forwardedValues: {
            cookies: { forward: "none" },
            queryString: false,
        },

        minTtl: 0,
        defaultTtl: cacheTimeout,
        maxTtl: cacheTimeout,
    },

    // "All" is the most broad distribution, and also the most expensive.
    // "100" is the least broad, and also the least expensive.
    priceClass: "PriceClass_All",

    // You can customize error responses. When CloudFront receives an error from the origin (e.g. S3 or some other
    // web service) it can return a different error code, and return the response for a different resource.
    customErrorResponses: [
        { errorCode: 404, responseCode: 404, responsePagePath: "/404.html" },
    ],

    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },

    viewerCertificate: {
        acmCertificateArn: validatedCertificate.certificateArn,  // Per AWS, ACM certificate must be in the us-east-1 region.
        sslSupportMethod: "sni-only",
    },

    loggingConfig: {
        bucket: logsBucket.bucketDomainName,
        includeCookies: false,
        prefix: `${config.domainName}/`,
    },
});

const apexRecord = new aws.route53.Record("apexRecord", {
    zoneId: hostedZone.zoneId,
    name: config.domainName,
    type: aws.route53.RecordTypes.A,
    aliases: [{
        name: cdn.domainName,
        zoneId: cdn.hostedZoneId,
        evaluateTargetHealth: true
    }]
});