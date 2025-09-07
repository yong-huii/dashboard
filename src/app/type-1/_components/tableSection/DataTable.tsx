import { useEffect, useState } from "react";
import { LoadingOutlined, RedoOutlined } from "@ant-design/icons";
import { ConfigProvider, Table, TableProps, Tooltip } from "antd";

import ResetButton from "@/_shared/components/ResetButton";
import TableTitle from "@/_shared/components/TableTitle";

import { DataType } from "./TableSection";

interface Props {
  data: DataType[];
  setDataCd: (dataCd: string) => void;
  tableSectionRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  refetch: () => void;
}

export default function DataTable({
  data,
  setDataCd,
  tableSectionRef,
  isLoading,
  refetch,
}: Props) {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const parent = tableSectionRef.current;
      if (!parent) return;
      const paddingEstimate = 64; // 타이틀 + 내부 여백
      const gap = 16; // gap-4
      const isLg = typeof window !== "undefined" && window.innerWidth >= 1024;
      if (isLg) {
        const infoEl = parent.querySelector(
          "[data-info-table]",
        ) as HTMLElement | null;
        const infoVisible =
          infoEl && window.getComputedStyle(infoEl).display !== "none";
        const infoHeight = infoVisible ? infoEl.offsetHeight : 0;
        const ownHeight =
          parent.clientHeight - (infoHeight ? infoHeight + gap : 0);
        setHeight(Math.max(ownHeight - paddingEstimate, 120));
      } else {
        // 모바일: info 숨김 -> 전체 사용
        setHeight(parent.clientHeight - paddingEstimate);
      }
    };
    update();
    window.addEventListener("resize", update);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro && tableSectionRef.current) ro.observe(tableSectionRef.current);
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [tableSectionRef]);

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
      // ellipsis 활성화 (테이블 레이아웃 fixed + width 필요)
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
    <div className="row-span-8 flex flex-col overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-md lg:row-span-5 lg:pt-0">
      <TableTitle title="비정형 분석 데이터">
        <ResetButton refetch={refetch} />
      </TableTitle>
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
              scroll={{ x: "max-content", y: height }}
              tableLayout="fixed"
              rootClassName="hover-scroll-table table-ellipsis"
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
