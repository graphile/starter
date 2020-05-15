import {
  ProfileSettingsForm_UserFragment,
  useChangeAvatarMutation,
} from "@app/graphql";
import { Icon, message, Upload } from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import { RcCustomRequestOptions, UploadFile } from "antd/lib/upload/interface";
import { ApolloError } from "apollo-client";
import axios from "axios";
import React, { useEffect, useState } from "react";

export function slugify(string: string) {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function getUid(name: string) {
  const randomHex = () => Math.floor(Math.random() * 16777215).toString(16);
  const fileNameSlug = slugify(name);
  return randomHex() + "-" + fileNameSlug;
}

export function AvatarUpload({
  user,
  setSuccess,
  setError,
}: {
  user: ProfileSettingsForm_UserFragment;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setError: (error: Error | ApolloError | null) => void;
}) {
  const [changeAvatar] = useChangeAvatarMutation();
  const [fileList, setFileList] = useState<any>(
    user && user.avatarUrl
      ? [
          {
            uid: "-1",
            name: "avatar",
            type: "image",
            size: 1,
            url: user.avatarUrl,
          },
        ]
      : null
  );

  useEffect(() => {
    if (user) {
      const avatar = user.avatarUrl;
      if (avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar",
            type: "image",
            size: 1,
            url: avatar,
          },
        ]);
      } else {
        setFileList(null);
      }
    }
  }, [user, user.avatarUrl]);

  // const onChange = (info: UploadChangeParam) => {
  //   console.log(info);
  //   setFileList([...fileList]);
  // };

  const beforeUpload = (file: any) => {
    const fileName = file.name.split(".")[0];
    const fileType = file.name.split(".")[1];
    file.uid = getUid(fileName) + "." + fileType;
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG or PNG images!");
      file.status = "error";
    }
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error("Image must smaller than 3MB!");
      file.status = "error";
    }
    return isJpgOrPng && isLt3M;
  };

  const changeUserAvatar = async (avatarUrl: string | null) => {
    setSuccess(false);
    setError(null);
    try {
      await changeAvatar({
        variables: {
          id: user.id,
          patch: {
            avatarUrl,
          },
        },
      });
      setError(null);
      setSuccess(true);
    } catch (e) {
      setError(e);
    }
  };

  const customRequest = (option: RcCustomRequestOptions) => {
    const { onSuccess, onError, file, onProgress } = option;
    axios
      .get(`${process.env.ROOT_URL}/api/s3`, {
        params: {
          key: file.uid,
          operation: "put",
        },
      })
      .then((response) => {
        const preSignedUrl = response.data.url;
        axios
          .put(preSignedUrl, file, {
            onUploadProgress: (e) => {
              const progress = Math.round((e.loaded / e.total) * 100);
              onProgress({ percent: progress }, file);
            },
          })
          .then((response) => {
            if (response.config.url) {
              changeUserAvatar(response.config.url.split("?")[0]);
              onSuccess(response.config, file);
            }
          })
          .catch((error) => {
            console.log(error);
            onError(error);
          });
      })
      .catch((error) => {
        console.log(error);
        onError(error);
      });
  };

  const deleteUserAvatarFromBucket = async () => {
    if (user && user.avatarUrl) {
      const key = user.avatarUrl.substring(user.avatarUrl.lastIndexOf("/") + 1);
      await axios
        .get(`${process.env.ROOT_URL}/api/s3`, {
          params: {
            key: `${key}`,
            operation: "delete",
          },
        })
        .then(() => {
          // this isn't confirmation that the item was deleted
          // only confimation that there wasnt an error..
          changeUserAvatar(null);
          return true;
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
          return false;
        });
    }
    return true;
  };

  const onRemove = async () => {
    if (await deleteUserAvatarFromBucket()) {
      setFileList(null);
    }
  };

  const uploadButton = (
    <div>
      <Icon type="plus" />
      <div className="ant-upload-text">Avatar</div>
    </div>
  );

  return (
    <div>
      <Upload
        name="avatar"
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onRemove={onRemove}
        showUploadList={{ showPreviewIcon: false, showDownloadIcon: false }}
      >
        {fileList && fileList.length >= 0 ? null : uploadButton}
      </Upload>
    </div>
  );
}
