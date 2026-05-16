"use client";

import { useEffect, useState } from "react";

import app from "../../firebase";

import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";

import { useParams } from "next/navigation";

const db = getFirestore(app);

export default function TrackOrder() {

  const params = useParams();

  const id = params.id;

  const [order, setOrder] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function getOrder() {

      const querySnapshot =
        await getDocs(
          collection(db, "orders")
        );

      querySnapshot.forEach((doc) => {

        const data = doc.data();

        if (data.orderId === id) {

          setOrder(data);
        }
      });

      setLoading(false);
    }

    getOrder();

  }, [id]);

  if (loading) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-3xl font-bold">
        Loading...
      </main>
    );
  }

  if (!order) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-3xl font-bold">
        Order Not Found
      </main>
    );
  }

  return (

    <main className="min-h-screen bg-slate-950 text-white p-10 flex items-center justify-center">

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-xl w-full shadow-2xl">

        <h1 className="text-5xl font-black mb-10 text-center">
          Track Order
        </h1>

        {order.image && (

          <img
            src={order.image}
            alt="product"
            className="w-full h-80 object-cover rounded-3xl mb-8"
          />

        )}

        <div className="space-y-5 text-xl">

          <p>
            👤 Customer:
            <span className="font-bold ml-2">
              {order.name}
            </span>
          </p>

          <p>
            🆔 Order ID:
            <span className="font-bold ml-2 break-all">
              {order.orderId}
            </span>
          </p>

          <p>
            📞 Phone:
            <span className="font-bold ml-2">
              {order.phone}
            </span>
          </p>

          <p>
            📍 Address:
            <span className="font-bold ml-2">
              {order.address}
            </span>
          </p>

          <p>
            💰 Price:
            <span className="font-bold ml-2">
              ${order.price}
            </span>
          </p>

        </div>

        <div className="mt-10 text-center">

          <span
            className={`px-8 py-4 rounded-3xl text-2xl font-black inline-block ${
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

      </div>

    </main>
  );
}