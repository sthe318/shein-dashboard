"use client";

import { useEffect, useMemo, useState } from "react";

import app from "./firebase";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { QRCodeCanvas } from "qrcode.react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const db = getFirestore(app);

type OrderType = {
  id?: string;
  orderId: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  price: string;
  image: string;
  status: string;
  createdAt: string;
};

export default function Home() {

  const [orders, setOrders] =
    useState<OrderType[]>([]);

  const [code, setCode] =
    useState("");

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [image, setImage] =
    useState<string>("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  // جلب الطلبات

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {

        const list: OrderType[] = [];

        snapshot.forEach((docu) => {

          list.push({
            id: docu.id,
            ...(docu.data() as OrderType),
          });

        });

        setOrders(list);
      }
    );

    return () => unsub();

  }, []);

  // إضافة طلب

  async function addOrder() {

    if (
      !code ||
      !name ||
      !phone ||
      !address ||
      !price
    ) {

      alert("املأ كل الحقول");

      return;
    }

    const orderId =
      "ORD-" +
      Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

    await addDoc(
      collection(db, "orders"),
      {
        orderId,
        code,
        name,
        phone,
        address,
        price,
        image,
        status: "Pending",
        createdAt:
          new Date().toLocaleDateString(),
      }
    );

    setCode("");
    setName("");
    setPhone("");
    setAddress("");
    setPrice("");
    setImage("");
  }

  // حذف طلب

  async function deleteOrder(
    id: string
  ) {

    await deleteDoc(
      doc(db, "orders", id)
    );
  }

  // تغيير الحالة

  async function changeStatus(
    id: string,
    current: string
  ) {

    const newStatus =
      current === "Pending"
        ? "Shipping"
        : current === "Shipping"
        ? "Delivered"
        : "Pending";

    await updateDoc(
      doc(db, "orders", id),
      {
        status: newStatus,
      }
    );
  }

  // Excel Export

  function exportExcel() {

    const worksheet =
      XLSX.utils.json_to_sheet(
        orders
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Orders"
    );

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    const data = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

    saveAs(data, "orders.xlsx");
  }

  // البحث والفلترة

  const filteredOrders =
    useMemo(() => {

      return orders.filter((order) => {

        const matchesSearch =
          order.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesFilter =
          filter === "All"
            ? true
            : order.status === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      });

    }, [orders, search, filter]);

  // الإحصائيات

  const totalOrders =
    orders.length;

  const deliveredOrders =
    orders.filter(
      (o) =>
        o.status === "Delivered"
    ).length;

  const shippingOrders =
    orders.filter(
      (o) =>
        o.status === "Shipping"
    ).length;

  const pendingOrders =
    orders.filter(
      (o) =>
        o.status === "Pending"
    ).length;

  const totalRevenue =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(order.price || 0),
      0
    );

  const totalProfit =
    totalRevenue * 0.2;

  return (

    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-10">

      {/* العنوان */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <div>

          <h1 className="text-5xl md:text-6xl font-black">
            Shein Dashboard
          </h1>

          <p className="text-gray-400 mt-3 text-lg">
            Professional Order Management System
          </p>

        </div>

        <button
          onClick={exportExcel}
          className="bg-green-500 hover:bg-green-600 px-6 py-4 rounded-2xl text-lg font-bold"
        >
          Export Excel
        </button>

      </div>

      {/* الإحصائيات */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">

        <div className="bg-white text-black p-6 rounded-3xl shadow-lg">

          <h2 className="text-xl font-bold">
            Total Orders
          </h2>

          <p className="text-5xl mt-4 font-black">
            {totalOrders}
          </p>

        </div>

        <div className="bg-white text-black p-6 rounded-3xl shadow-lg">

          <h2 className="text-xl font-bold">
            Pending
          </h2>

          <p className="text-5xl mt-4 font-black text-yellow-500">
            {pendingOrders}
          </p>

        </div>

        <div className="bg-white text-black p-6 rounded-3xl shadow-lg">

          <h2 className="text-xl font-bold">
            Shipping
          </h2>

          <p className="text-5xl mt-4 font-black text-blue-500">
            {shippingOrders}
          </p>

        </div>

        <div className="bg-white text-black p-6 rounded-3xl shadow-lg">

          <h2 className="text-xl font-bold">
            Delivered
          </h2>

          <p className="text-5xl mt-4 font-black text-green-500">
            {deliveredOrders}
          </p>

        </div>

        <div className="bg-white text-black p-6 rounded-3xl shadow-lg">

          <h2 className="text-xl font-bold">
            Revenue
          </h2>

          <p className="text-4xl mt-4 font-black">
            ${totalRevenue}
          </p>

          <p className="mt-3 text-green-600 font-bold">
            Profit: ${totalProfit}
          </p>

        </div>

      </div>

      {/* إضافة طلب */}

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl mb-10">

        <h2 className="text-3xl font-bold mb-6">
          Add New Order
        </h2>

        <div className="grid md:grid-cols-7 gap-4">

          <input
            type="text"
            placeholder="Order Code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            className="p-4 rounded-2xl text-black"
          />

          <input
            type="text"
            placeholder="Customer Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="p-4 rounded-2xl text-black"
          />

          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="p-4 rounded-2xl text-black"
          />

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            className="p-4 rounded-2xl text-black"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            className="p-4 rounded-2xl text-black"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e: any) => {

              const file =
                e.target.files[0];

              if (!file) return;

              const reader =
                new FileReader();

              reader.onloadend =
                () => {

                  setImage(
                    reader.result as string
                  );

                };

              reader.readAsDataURL(file);

            }}
            className="p-4 rounded-2xl bg-white text-black"
          />

          <button
            onClick={addOrder}
            className="bg-pink-500 hover:bg-pink-600 rounded-2xl text-xl font-bold"
          >
            Add Order
          </button>

        </div>

      </div>

      {/* البحث والفلترة */}

      <div className="flex flex-col md:flex-row gap-4 mb-10">

        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="p-4 rounded-2xl text-black w-full"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
          className="p-4 rounded-2xl text-black md:w-72"
        >

          <option>
            All
          </option>

          <option>
            Pending
          </option>

          <option>
            Shipping
          </option>

          <option>
            Delivered
          </option>

        </select>

      </div>

      {/* الطلبات */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

        {filteredOrders.map((order) => (

          <div
            key={order.id}
            className="bg-white text-black rounded-3xl p-6 shadow-2xl"
          >

            {order.image && (

              <img
                src={order.image}
                alt="product"
                className="w-full h-72 object-cover rounded-2xl mb-5"
              />

            )}

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-3xl font-black">
                {order.name}
              </h2>

              <span className="bg-black text-white px-4 py-2 rounded-xl text-sm">
                {order.code}
              </span>

            </div>

            <div className="space-y-3 text-lg">

              <p>
                🆔 {order.orderId}
              </p>

              <p>
                📅 {order.createdAt}
              </p>

              <p>
                📞 {order.phone}
              </p>

              <p>
                📍 {order.address}
              </p>

              <p>
                💰 ${order.price}
              </p>

            </div>

            <div className="mt-5">

              <span
                className={`px-5 py-3 rounded-2xl text-white font-bold inline-block ${
                  order.status === "Pending"
                    ? "bg-yellow-500"
                    : order.status === "Shipping"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              >
                {order.status}
              </span>

            </div>

            {/* QR */}

            <div className="mt-8 flex flex-col items-center justify-center bg-gray-100 rounded-3xl p-6">

              <QRCodeCanvas
                value={`https://shein-dashboard-pi.vercel.app/track/${order.orderId}`}
                size={180}
              />

              <p className="text-sm mt-4 text-center break-all">

                https://shein-dashboard-pi.vercel.app/track/{order.orderId}

              </p>

            </div>

            {/* الأزرار */}

            <div className="grid grid-cols-3 gap-3 mt-8">

              <button
                onClick={() =>
                  changeStatus(
                    order.id || "",
                    order.status
                  )
                }
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-bold"
              >
                Status
              </button>

              <button
                onClick={() =>
                  deleteOrder(
                    order.id || ""
                  )
                }
                className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold"
              >
                Delete
              </button>

              <a
                href={`https://wa.me/${order.phone}`}
                target="_blank"
                className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-bold text-center"
              >
                WhatsApp
              </a>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}