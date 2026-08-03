"use client";

interface Props {
  amount: number;
}

export default function TransactionAmount({
  amount,
}: Props) {
  return (
    <div className="text-right">

      <div className="font-semibold">

        ₹{amount.toLocaleString("en-IN")}

      </div>

    </div>
  );
}