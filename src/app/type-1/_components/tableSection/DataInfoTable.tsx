import { LoadingOutlined } from "@ant-design/icons";
import { Table, TableProps } from "antd";

import TableTitle from "@/_shared/components/TableTitle";
import useDataCdStore from "@/_shared/store/type-1/dataCd";
import { formatNumber } from "@/_shared/utils/formatNumber";

import { DataType } from "./TableSection";

interface Props {
  data: DataType[];
  isLoading: boolean;
}

interface RowItem {
  key: string;
  label: string;
  value: React.ReactNode;
}

export default function DataInfoTable({ data, isLoading }: Props) {
  const { dataCd } = useDataCdStore();
  const infoData = data.find(item => item.dataCd === dataCd);

  const rows: RowItem[] = infoData
    ? [
        { key: "anlMdl", label: "분석모델", value: infoData.anlMdl },
        {
          key: "oputFile",
          label: "파일",
          value: formatNumber((infoData as any)?.oputFile),
        },
        {
          key: "lnCnt",
          label: "데이터",
          value: formatNumber((infoData as any)?.lnCnt),
        },
        {
          key: "dataSize",
          label: "사이즈(KB)",
          value: formatNumber((infoData as any)?.dataSize),
        },
        { key: "vbgRgnId", label: "작업자", value: infoData.vbgRgnId },
        {
          key: "vbgRgstTismp",
          label: "처리일시",
          value: infoData.vbgRgstTismp,
        },
      ]
    : [];

  const columns: TableProps<RowItem>["columns"] = [
    {
      title: "항목",
      dataIndex: "label",
      key: "label",
      width: "40%",
      onCell: record => ({
        style: {
          fontSize: 12,
          fontWeight: 600,
          color: "#555879",
          background: "#f3f4f6",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 160,
        },
        title: typeof record.label === "string" ? record.label : undefined,
      }),
      render: (value: any) => (value == null ? "" : value),
    },
    {
      title: "값",
      dataIndex: "value",
      key: "value",
      onCell: record => ({
        style: {
          fontSize: 12,
          color: "#555879",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 220,
        },
        title: typeof record.value === "string" ? record.value : undefined,
      }),
      render: (value: any) => (value == null ? "" : value),
    },
  ];

  return (
    <div
      data-info-table
      className="hidden min-h-[282px] flex-col overflow-hidden rounded-lg bg-white px-4 pb-4 shadow-md lg:flex"
    >
      <TableTitle title="데이터 분석 정보" />
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingOutlined style={{ fontSize: 36, color: "#555879" }} />
        </div>
      ) : (
        <div className="border-x border-t border-[#F0F0F0]">
          <Table<RowItem>
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
            showHeader={false}
            tableLayout="fixed"
            rowKey="key"
          />
        </div>
      )}
    </div>
  );
}
