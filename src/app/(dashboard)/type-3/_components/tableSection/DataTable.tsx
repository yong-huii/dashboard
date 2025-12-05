import { useEffect, useRef, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { ConfigProvider, Table, TableProps } from "antd";

import ResetButton from "@/_shared/components/ResetButton";
import TableTitle from "@/_shared/components/TableTitle";
import useIsLgUp from "@/_shared/hooks/useIsLgUp";
import useDataCdStore from "@/_shared/store/type-1/dataCd";

import { DataType } from "./TableSection";

interface Props {
  data: DataType[];
  isLoading: boolean;
  refetch: () => void;
}

export default function DataTable({ data, isLoading, refetch }: Props) {
  const isLgUp = useIsLgUp();
  const wrapRef = useRef<HTMLDivElement>(null);

  const { dataCd, setDataCd } = useDataCdStore();

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "데이터코드",
      dataIndex: "dataCd",
      key: "dataCd",
      ellipsis: true,
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
          maxWidth: 70,
        },
        title: record.dataCd,
      }),
    },
    {
      title: "데이터명",
      dataIndex: "srcDataNm",
      key: "srcDataNm",
      ellipsis: { showTitle: false },
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
          textAlign: "start",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 100,
        },
        title: record.srcDataNm,
      }),
    },
  ];

  return (
    <div
      className="row-span-8 flex flex-col overflow-hidden rounded-lg bg-white p-6 shadow-md lg:row-span-5 lg:pt-0"
      ref={wrapRef}
    >
      <TableTitle title="비정형 데이터 분석" />
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingOutlined style={{ fontSize: 36, color: "#555879" }} />
        </div>
      ) : (
        <div className="border-x border-t border-[#F0F0F0]">
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
              dataSource={data ?? []}
              pagination={false}
              size="small"
              scroll={{
                x: "max-content",
                y:
                  (wrapRef.current?.clientHeight || 0) < 390
                    ? isLgUp
                      ? (wrapRef.current?.clientHeight || 0) - 95
                      : (wrapRef.current?.clientHeight || 0) - 67
                    : undefined,
              }}
              tableLayout="fixed"
              rootClassName="hover-scroll-table table-ellipsis cursor-pointer"
              rowClassName={record =>
                record.dataCd === dataCd ? "selected-row" : ""
              }
              onRow={row => ({
                onClick: () => {
                  setDataCd(row.dataCd);
                },
              })}
              rowKey="dataCd"
            />
          </ConfigProvider>
        </div>
      )}
    </div>
  );
}
