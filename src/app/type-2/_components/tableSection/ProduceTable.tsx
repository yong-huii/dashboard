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
  const { date, setDate } = useDateStore();
  const { data, isLoading } = useGetProduceList(date);

  // ================== 개발용 Mock Data (API 미응답 시) ==================
  // - name: 설비명 (마지막 "총합" 행 포함)
  // - total_count / error_cnt: 문자열 숫자 형태로 API 형식 맞춤
  // - date: 첫 행에서 초기 날짜 추출 (YYYY-MM-DD)
  const mockData: DataType[] = useMemo(
    () => [
      {
        name: "사출기1호",
        total_count: "187234",
        error_cnt: "102",
        date: "2025-09-07",
      },
      {
        name: "사출기2호",
        total_count: "165221",
        error_cnt: "87",
        date: "2025-09-07",
      },
      {
        name: "사출기3호",
        total_count: "142890",
        error_cnt: "64",
        date: "2025-09-07",
      },
      {
        name: "사출기4호",
        total_count: "158004",
        error_cnt: "55",
        date: "2025-09-07",
      },
      {
        name: "총합",
        total_count: "653349",
        error_cnt: "308",
        date: "2025-09-07",
      },
    ],
    [],
  );

  const dataset = data && data.length > 0 ? data : mockData;

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
    if (dataset && dataset.length > 0) {
      const firstDate = dataset[0].date || dayjs().format("YYYY-MM-DD");
      setDate(dayjs(firstDate).format("YYYYMMDD"));
      initializedRef.current = true;
    }
  }, [dataset, setDate]);

  return (
    <div
      ref={wrapRef}
      className="row-span-4 overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-md lg:row-span-3 lg:grid lg:pt-0"
    >
      <TableTitle title="일생산량">
        {isLoading || (
          <div className="flex items-center gap-1">
            <LeftButton date={date} setDate={setDate} />
            <DatePicker
              value={dayjs(date)}
              onChange={DatePickerHandler}
              className="produce-date-picker w-[5.6rem]"
              style={{ color: "#555879" }}
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
            dataSource={dataset}
            pagination={false}
            size="small"
            tableLayout="fixed"
            scroll={{ x: "max-content", y: innerHeight - 70 }}
            rootClassName="hover-scroll-table table-ellipsis side-border-table"
            rowKey="name"
          />
        </ConfigProvider>
      )}
    </div>
  );
}
