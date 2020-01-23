# Graphile Starter - Avatar Photo Upload

To use

Create an S3 bucket
in permissions -> block public access, uncheck
- Block all public access
- Block public access to buckets and objects granted through new public bucket or access point policies
- Block public and cross-account access to buckets and objects through any public bucket or access point policies

in permissions -> bucket policy, add
(This allows the public to get all the files in the bucket, so make sure thats what you want.)
Replace BUCKET_NAME with your own
```
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_NAME/*"
        }
    ]
}
```
Go to AWS IAM Managment Console
Add user
Programmatic access
next
Attach existing policies directly
Create Policy
Json
Paste the following policy
Replace BUCKET_NAME with your own
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::BUCKET_NAME/*"
            ]
        }
    ]
}
```
name the policy
create policy
return to IAM Managment Console
refresh and add the new policy to the new user
finish creating user
save the Access key ID and Secret access key


add AWS S3 bucket config to .env
```
BUCKET=XXX
AWSACCESSKEYID=XXX
AWSSECRETKEY=XXX
AWS_REGION=XXX
```
