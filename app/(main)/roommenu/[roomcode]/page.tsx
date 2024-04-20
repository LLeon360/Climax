"use client";

export default function Page({ params }: { params: { roomcode: string } }) {
	return (
		<div className="grow flex flex-col items-center justify-center">
			<section className="w-[32rem] space-y-4">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
					{params.roomcode}
				</h1>
			</section>
		</div>
	);
}
