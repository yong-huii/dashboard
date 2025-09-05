"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ConfigProvider, Table, TableProps } from "antd";

import useGetErrorDataList from "@/_shared/api/services/type-2/useGetErrorDataList";
import useGetLastHourDataList from "@/_shared/api/services/type-2/useGetLastHourDataList";
import useGetStatusList from "@/_shared/api/services/type-2/useGetStatusList";
import ResetButton from "@/_shared/components/ResetButton";
import TableTitle from "@/_shared/components/TableTitle";
import useDataCdStore from "@/_shared/store/type-2/dataCd";
import { formatNumber } from "@/_shared/utils/formatNumber";

interface DataType {
  [key: string]: string;
}

export default function StatusTable() {
  const { data, isLoading: isStatusLoading } = useGetStatusList();
  const { data: lastHourData, isLoading: isLastHourLoading } =
    useGetLastHourDataList();
  const { dataCd, assetCd, setDataCd, setAssetCd } = useDataCdStore();

  const { data: errorData } = useGetErrorDataList(dataCd, assetCd);

  useEffect(() => {
    setDataCd(data?.[0]?.DATA_CD || "");
    setAssetCd(data?.[0]?.ASSET_CD || "");
  }, [data, setDataCd, setAssetCd]);

  // grid row 내부 자체 높이 측정 (스크롤 y 계산용)
  const wrapRef = useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = useState<number>(0);
  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      setInnerHeight(el.clientHeight);
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      if (wrapRef.current) ro.observe(wrapRef.current);
      window.addEventListener("resize", measure);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", measure);
      };
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const tableData = lastHourData?.map((item, idx) => ({
    ...item,
    DATA_CD: data?.[idx]?.DATA_CD || "",
    ASSET_CD: data?.[idx]?.ASSET_CD || "",
  }));

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "설비",
      dataIndex: "assetNm",
      key: "assetNm",
      ellipsis: true,
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
          fontSize: 12,
          color: "#555879",
        },
      }),
      onCell: record => {
        return {
          style: {
            fontSize: 12,
            color: "#555879",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        };
      },
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      ellipsis: true,
      width: 60,
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
          fontSize: 12,
          color: "#555879",
        },
      }),
      onCell: record => ({
        style: {
          fontSize: 12,
          color: "#555879",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      }),
      render: (_: any, record) => {
        const v = (record.status || "").toLowerCase();
        if (v === "0") {
          return (
            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 16 }} />
          );
        } else if (v === "1") {
          return (
            <ExclamationCircleOutlined
              style={{ color: "#faad14", fontSize: 16 }}
            />
          );
        } else {
          return (
            <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 16 }} />
          );
        }
      },
    },
    {
      title: "에러",
      dataIndex: "error_cnt",
      key: "error_cnt",
      ellipsis: true,
      width: 60,
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
          fontSize: 12,
          color: "#555879",
        },
      }),
      onCell: record => ({
        style: {
          fontSize: 12,
          color: "#555879",
          textAlign: "right",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
        title: formatNumber(record.error_cnt),
      }),
      render: (value: any) => formatNumber(value),
    },
  ];

  return (
    <div
      ref={wrapRef}
      className="row-span-1 flex flex-col overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-md lg:row-span-1 lg:pt-0"
      style={{ height: "100%" }}
    >
      <TableTitle title="설비상태">
        <span className="text-xs font-[500] text-blue-800">
          {errorData?.[0]?.DTM.slice(0, 19)}
        </span>
      </TableTitle>
      {isLastHourLoading && isStatusLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingOutlined style={{ fontSize: 36, color: "#555879" }} />
        </div>
      ) : (
        <div className="border border-[#F0F0F0]">
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBorderRadius: 0,
                  headerBg: "#F3F4F6",
                },
              },
            }}
          >
            <Table<DataType>
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="small"
              scroll={{ x: "max-content", y: innerHeight - 70 }}
              tableLayout="fixed"
              rootClassName="hover-scroll-table table-ellipsis"
              rowKey="assetNm"
              onRow={row => ({
                onClick: () => {
                  setDataCd(row.DATA_CD);
                  setAssetCd(row.ASSET_CD);
                },
              })}
            />
          </ConfigProvider>
        </div>
      )}
    </div>
  );
}
