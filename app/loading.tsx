import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function Loading() {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spin indicator={<LoadingOutlined spin />} size="large" />
    </div>
  );
}
