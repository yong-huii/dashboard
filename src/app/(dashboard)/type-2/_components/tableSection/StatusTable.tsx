"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import TableTitle from "@/_shared/components/TableTitle";
import useIsLgUp from "@/_shared/hooks/useIsLgUp";
import useDataCdStore from "@/_shared/store/type-2/dataCd";
import { formatNumber } from "@/_shared/utils/formatNumber";

interface DataType {
  [key: string]: string;
}

export default function StatusTable() {
  const isLgUp = useIsLgUp();
  const { data, isLoading: isStatusLoading } = useGetStatusList();
  const { data: lastHourData, isLoading: isLastHourLoading } =
    useGetLastHourDataList();
  const { dataCd, assetCd, setDataCd, setAssetCd } = useDataCdStore();

  const { data: errorData } = useGetErrorDataList(dataCd, assetCd);

  const initializedRef = useRef(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (initializedRef.current) return;

    if (data && data.length > 0) {
      const firstDataCd = data[0].DATA_CD || "";
      const firstAssetCd = data[0].ASSET_CD || "";
      setDataCd(firstDataCd);
      setAssetCd(firstAssetCd);
      initializedRef.current = true;
    }
  }, [data, setDataCd, setAssetCd]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // 현재 선택된 dataCd와 동기화
    const currentIndex = data.findIndex(d => d.DATA_CD === dataCd);
    indexRef.current = currentIndex >= 0 ? currentIndex : 0;

    const timer = setInterval(() => {
      if (!data || data.length === 0) return;
      indexRef.current = (indexRef.current + 1) % data.length;
      setDataCd(data[indexRef.current].DATA_CD);
      setAssetCd(data[indexRef.current].ASSET_CD);
    }, 30000);

    return () => clearInterval(timer);
  }, [data, dataCd, setDataCd]);

  const wrapRef = useRef<HTMLDivElement>(null);

  const tableData = lastHourData?.map((item, idx) => ({
    ...item,
    DATA_CD:
      data && data.length > 0
        ? data[idx]?.DATA_CD || data[0]?.DATA_CD || ""
        : "",
    ASSET_CD:
      data && data.length > 0
        ? data[idx]?.ASSET_CD || data[0]?.ASSET_CD || ""
        : "",
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
      width: 40,
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
      width: 55,
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
    {
      title: "경고",
      dataIndex: "warning_cnt",
      key: "warning_cnt",
      ellipsis: true,
      width: 55,
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
        title: formatNumber(record.warning_cnt),
      }),
      render: (value: any) => formatNumber(value),
    },
  ];

  return (
    <div
      ref={wrapRef}
      className="row-span-4 flex flex-col overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-md lg:row-span-5 lg:pt-0"
    >
      <TableTitle title="사출설비 상태">
        <span className="text-xs font-[500] text-blue-800">
          {errorData?.[0]?.DTM.slice(0, 19)}
        </span>
      </TableTitle>
      {isLastHourLoading && isStatusLoading && !data ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingOutlined style={{ fontSize: 36, color: "#555879" }} />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col">
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
              scroll={{
                x: "max-content",
                y:
                  (wrapRef.current?.clientHeight || 0) < 300
                    ? isLgUp
                      ? (wrapRef.current?.clientHeight || 0) - 95
                      : (wrapRef.current?.clientHeight || 0) - 67
                    : undefined,
              }}
              tableLayout="fixed"
              rootClassName="hover-scroll-table table-ellipsis side-border-table"
              rowClassName={record =>
                record.DATA_CD === dataCd ? "selected-row" : ""
              }
              rowKey="assetNm"
              onRow={row => ({
                onClick: () => {
                  setDataCd(row.DATA_CD);
                  setAssetCd(row.ASSET_CD);
                },
              })}
            />
          </ConfigProvider>
          <div className="hidden h-full w-full items-center justify-center lg:flex">
            <img src="/image/Injection.svg" alt="" />
          </div>
        </div>
      )}
    </div>
  );
}
