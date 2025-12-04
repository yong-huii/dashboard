import { useEffect, useMemo, useRef, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import {
  ConfigProvider,
  DatePicker,
  DatePickerProps,
  Table,
  TableProps,
} from "antd";
import dayjs from "dayjs";

import useGetProduceList from "@/_shared/api/services/type-2/useGetProduceList";
import TableTitle from "@/_shared/components/TableTitle";
import useIsLgUp from "@/_shared/hooks/useIsLgUp";
import useDateStore from "@/_shared/store/type-2/date";
import { formatNumber } from "@/_shared/utils/formatNumber";

import LeftButton from "./LeftButton";
import RightButton from "./RightButton";

interface DataType {
  name: string;
  total_count: string;
  error_cnt: string;
  date?: string; // 실제 API 데이터 대비 (초기 날짜 추출용)
}

export default function ProduceTable() {
  const isLgUp = useIsLgUp();
  const { date, setDate } = useDateStore();
  const { data, isLoading } = useGetProduceList(date);

  const wrapRef = useRef<HTMLDivElement>(null);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "설비",
      dataIndex: "name",
      key: "name",
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
          fontWeight: record.name === "총합" ? 500 : undefined,
        },
        title: record.name,
      }),
    },
    {
      title: "생산량",
      dataIndex: "total_count",
      key: "total_count",
      ellipsis: true,
      width: 80,
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
          fontWeight: record.name === "총합" ? 500 : undefined,
        },
        title: record.total_count,
      }),
      render: (value: any) => formatNumber(value),
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
          fontWeight: record.name === "총합" ? 500 : undefined,
        },
        title: record.error_cnt,
      }),
      render: (value: any) => formatNumber(value),
    },
  ];

  const DatePickerHandler: DatePickerProps["onChange"] = (_, dateString) => {
    const date = Array.isArray(dateString)
      ? dateString[0].replace(/-/g, "")
      : dateString.replace(/-/g, "");

    setDate(date);
  };

  // 최초 데이터 로딩 시 한 번만 date를 초기화
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return; // 이미 초기화됨
    if (data && data.length > 0) {
      const firstDate = data[0].date || dayjs().format("YYYY-MM-DD");
      setDate(dayjs(firstDate).format("YYYYMMDD"));
      initializedRef.current = true;
    }
  }, [data, setDate]);

  return (
    <div
      ref={wrapRef}
      className="row-span-4 flex-col overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-md lg:row-span-3 lg:flex lg:pt-0"
    >
      <TableTitle title="일일 생산정보">
        {isLoading || (
          <div className="flex items-center gap-1">
            <LeftButton date={date} setDate={setDate} />
            <DatePicker
              value={dayjs(date)}
              onChange={DatePickerHandler}
              className="produce-date-picker w-[5.6rem]"
              style={{ color: "#555879", paddingLeft: 11 }}
              allowClear={false}
              size="small"
              suffixIcon={null}
            />
            <RightButton date={date} setDate={setDate} />
          </div>
        )}
      </TableTitle>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingOutlined style={{ fontSize: 36, color: "#555879" }} />
        </div>
      ) : (
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
            dataSource={data}
            pagination={false}
            size="small"
            tableLayout="fixed"
            scroll={{
              x: "max-content",
              y:
                (wrapRef.current?.clientHeight || 0) < 235
                  ? isLgUp
                    ? (wrapRef.current?.clientHeight || 0) - 95
                    : (wrapRef.current?.clientHeight || 0) - 67
                  : undefined,
            }}
            rootClassName="hover-scroll-table table-ellipsis side-border-table"
            rowKey="name"
          />
        </ConfigProvider>
      )}
    </div>
  );
}
