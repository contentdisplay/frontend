
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "credit" | "debit";
};

type TransactionsListProps = {
  transactions: Transaction[];
};

const TransactionsList = ({ transactions }: TransactionsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                  No transactions yet
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="flex items-center">
                    {transaction.type === "credit" ? (
                      <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 mr-1 text-amber-500" />
                    )}
                    <span className={transaction.type === "credit" ? "text-green-600" : "text-amber-600"}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
