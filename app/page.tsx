{/* QR */}

<div className="mt-8 flex flex-col items-center justify-center bg-slate-800 rounded-3xl p-6">

  <QRCodeCanvas
    value={`https://shein-dashboard-pi.vercel.app/track/${order.orderId}`}
    size={180}
  />

  <p className="text-sm mt-4 text-center break-all text-slate-300">

    https://shein-dashboard-pi.vercel.app/track/{order.orderId}

  </p>

</div>