import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Transaction } from "@/services/walletService";

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading: boolean;
  title: string;
}

const TransactionsList = ({ transactions, isLoading, title }: TransactionsListProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
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
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                  Loading transactions...
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No transactions yet
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const isCredit = ['deposit', 'earn', 'refund'].includes(transaction.transaction_type);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {transaction.article_title || transaction.transaction_type}
                    </TableCell>
                    <TableCell className="flex items-center">
                      {isCredit ? (
                        <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 mr-1 text-amber-500" />
                      )}
                      <span className={isCredit ? "text-green-600" : "text-amber-600"}>
                        ₹{Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${
                        transaction.status === 'approved' ? 'text-green-600' :
                        transaction.status === 'rejected' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {transaction.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;