"use client";

import { useEffect, useState } from "react";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import app from "./firebase";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const db = getFirestore(app);

export default function Home() {

  const [orders, setOrders] = useState<any[]>([]);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");

  const [image, setImage] =
    useState<string>("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  // جلب الطلبات
  const fetchOrders = async () => {

    const querySnapshot = await getDocs(
      collection(db, "orders")
    );

    const data: any[] = [];

    querySnapshot.forEach((docItem) => {

      data.push({
        id: docItem.id,
        ...docItem.data(),
      });

    });

    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // إضافة طلب
  const addOrder = async () => {

    if (
      !code ||
      !name ||
      !phone ||
      !price
    ) {

      alert("املأ كل الحقول");

      return;
    }

    const orderId =
      "ORD-" + Date.now();

    await addDoc(
      collection(db, "orders"),
      {

        code,

        orderId,

        name,
        phone,
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
    setPrice("");
    setImage("");

    fetchOrders();
  };

  // حذف
  const deleteOrder = async (
    id: string
  ) => {

    await deleteDoc(
      doc(db, "orders", id)
    );

    fetchOrders();
  };

  // تغيير الحالة
  const changeStatus = async (
    id: string,
    currentStatus: string
  ) => {

    const newStatus =

      currentStatus === "Pending"

        ? "Shipping"

        : currentStatus === "Shipping"

        ? "Delivered"

        : "Pending";

    await updateDoc(
      doc(db, "orders", id),
      {
        status: newStatus,
      }
    );

    fetchOrders();
  };

  // فلترة
  const filteredOrders =
    orders.filter((order) => {

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

  // الإحصائيات
  const totalOrders =
    orders.length;

  const deliveredOrders =
    orders.filter(
      (o) =>
        o.status === "Delivered"
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

  // Excel
  const exportExcel = () => {

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
  };

  return (

    <main className="p-10 bg-gray-900 min-h-screen text-white">

      <h1 className="text-5xl font-bold mb-10">
        Shein Dashboard
      </h1>

      {/* Excel */}

      <button
        onClick={exportExcel}
        className="bg-green-500 px-5 py-3 rounded-xl mb-10"
      >
        Export Excel
      </button>

      {/* الإحصائيات */}

      <div className="grid grid-cols-4 gap-5 mb-10">

        <div className="bg-white text-black p-5 rounded-2xl">

          <h2 className="text-xl font-bold">
            Total Orders
          </h2>

          <p className="text-3xl mt-3">
            {totalOrders}
          </p>

        </div>

        <div className="bg-white text-black p-5 rounded-2xl">

          <h2 className="text-xl font-bold">
            Delivered
          </h2>

          <p className="text-3xl mt-3">
            {deliveredOrders}
          </p>

        </div>

        <div className="bg-white text-black p-5 rounded-2xl">

          <h2 className="text-xl font-bold">
            Revenue
          </h2>

          <p className="text-3xl mt-3">
            ${totalRevenue}
          </p>

        </div>

        <div className="bg-white text-black p-5 rounded-2xl">

          <h2 className="text-xl font-bold">
            Profit
          </h2>

          <p className="text-3xl mt-3">
            ${totalProfit}
          </p>

        </div>

      </div>

      {/* إضافة طلب */}

      <div className="grid grid-cols-6 gap-3 mb-10">

        <input
          type="text"
          placeholder="Order Code"
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
          className="p-3 rounded-xl bg-white text-black"
        />

        <input
          type="text"
          placeholder="Customer Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="p-3 rounded-xl bg-white text-black"
        />

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          className="p-3 rounded-xl bg-white text-black"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          className="p-3 rounded-xl bg-white text-black"
        />

        {/* رفع صورة */}

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

            reader.readAsDataURL(
              file
            );
          }}
          className="p-3 rounded-xl bg-white text-black"
        />

        <button
          onClick={addOrder}
          className="bg-pink-500 hover:bg-pink-600 rounded-xl font-bold"
        >
          Add Order
        </button>

      </div>

      {/* البحث والفلترة */}

      <div className="flex gap-3 mb-10">

        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="p-3 rounded-xl bg-white text-black w-72"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value
            )
          }
          className="p-3 rounded-xl bg-white text-black"
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

      <div className="grid gap-5">

        {filteredOrders.map(
          (order) => (

            <div
              key={order.id}
              className="bg-white text-black p-5 rounded-2xl shadow-lg"
            >

              {order.image && (

                <img
                  src={order.image}
                  alt="product"
                  className="w-40 rounded-xl mb-5"
                />

              )}

              <h2 className="text-2xl font-bold">
                {order.name}
              </h2>

              <p className="mt-2">
                🔑 {order.code}
              </p>

              <p className="mt-2">
                🆔 {order.orderId}
              </p>

              <p className="mt-2">
                📅 {order.createdAt}
              </p>

              <p className="mt-2">
                📞 {order.phone}
              </p>

              <p className="mt-2">
                💰 ${order.price}
              </p>

              <p className="mt-2 font-bold text-pink-600">
                {order.status}
              </p>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() =>
                    changeStatus(
                      order.id,
                      order.status
                    )
                  }
                  className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                >
                  Change Status
                </button>

                <button
                  onClick={() =>
                    deleteOrder(
                      order.id
                    )
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-xl"
                >
                  Delete
                </button>

                <a
                  href={`https://wa.me/${order.phone}`}
                  target="_blank"
                  className="bg-green-500 text-white px-4 py-2 rounded-xl"
                >
                  WhatsApp
                </a>

              </div>

            </div>

          )
        )}

      </div>

    </main>
  );
}